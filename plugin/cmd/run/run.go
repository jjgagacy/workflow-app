package run

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/local_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/testing_utils"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/joho/godotenv"
)

func RunPlugin(payload RunPluginPayload) {
	err := runPlugin(payload)
	if err != nil {
		runLog(GenericResponse{
			Type:     GENERIC_RESPONSE_TYPE_ERROR,
			Response: map[string]any{"error": err.Error()},
		}, payload.ResponseFormat)
	}
}

func runPlugin(payload RunPluginPayload) error {
	// enable logs
	utils.SetLogVisibility(payload.EnableLogs)
	// init routine pool
	utils.InitPool(10000)

	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("error loading .env file")
	}

	tempDir := os.TempDir()
	dir, err := os.MkdirTemp(tempDir, "plugin-run-*")
	if err != nil {
		return errors.Join(err, fmt.Errorf("create temp directory error"))
	}
	defer testing_utils.ClearTestingPath(dir)

	// remove the temp directory when the program shuts down
	setupSignalHandler(dir)

	var pluginFile []byte
	switch payload.ZipFilePlugin {
	case true:
		// decode the plugin zip file
		pluginFile, err = os.ReadFile(payload.PluginPath)
		if err != nil {
			return errors.Join(err, fmt.Errorf("read plugin zip file error"))
		}
	default:
		dec, err := decoder.NewFSPluginDecoder(payload.PluginPath)
		if err != nil {
			utils.Error("failed to create plugin decoder, plugin path: %s, error: %v", payload.PluginPath, err)
			os.Exit(-1)
		}
		packager := plugin_packager.NewPackager(dec)
		pluginFile, err = packager.Pack(int64(5 * 1024 * 1024))

		if err != nil {
			utils.Error("failed to package plugin: %v", err)
			os.Exit(-1)
		}
	}
	zipDecoder, err := decoder.NewZipPluginDecoder(pluginFile)
	if err != nil {
		return errors.Join(err, fmt.Errorf("decode plugin file error"))
	}
	declaration, err := zipDecoder.Manifest()

	if err != nil {
		return errors.Join(err, fmt.Errorf("get declaration error"))
	}

	runLog(GenericResponse{
		Type:     GENERIC_RESPONSE_TYPE_INFO,
		Response: map[string]any{"info": "loading plugin"},
	}, payload.ResponseFormat)

	// launch the plugin locally and returns a local runtime
	runtime, err := testing_utils.GetRuntime(pluginFile, dir)
	if err != nil {
		return err
	}

	// check the identity
	_, err = runtime.Identity()
	if err != nil {
		return err
	}

	var stream *utils.Stream[client]
	switch payload.RunMode {
	case RUN_MODE_STDIO:
		// create a stream of clients that are connected to the plugin through stdin and stdout
		// NOTE: for stdio, there will only be one client and the stream will never close
		stream = createStdioServer()
	case RUN_MODE_TCP:
		// create a stream of clients that are connected to the plugin through a TCP connection
		// NOTE: for tcp, there will be multiple clients and the stream will close when the client
		// is closed
		stream, err = createTCPServer(&payload)
		if err != nil {
			return err
		}
	default:
		return fmt.Errorf("invalid run mode: %s", payload.RunMode)
	}

	// start a routine to handle the client system
	for stream.Next() {
		client, err := stream.Read()
		if err != nil {
			runLog(GenericResponse{
				Type:     GENERIC_RESPONSE_TYPE_ERROR,
				Response: map[string]any{"error": err.Error()},
			}, payload.ResponseFormat)
			continue
		}

		utils.Submit(nil, func() {
			handleClient(client, &declaration, runtime, payload.ResponseFormat)
		})
	}

	return nil
}

func setupSignalHandler(dir string) {
	sig := make(chan os.Signal, 1)

	signal.Notify(sig, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sig
		os.RemoveAll(dir)
		os.Exit(0)
	}()
}

func handleClient(
	client client,
	declaration *plugin_entities.PluginDeclaration,
	runtime *local_runtime.LocalPluginRuntime,
	responseFormat string,
) {
	// handle request from client
	scanner := bufio.NewScanner(client.reader)
	scanner.Buffer(make([]byte, 1024*1024), 15*1024*1024)

	// generate a random user id, tenant id and cluster id
	userId := uuid.New().String()
	tenantId := uuid.New().String()

	pluginUniqueIdentifier, _ := runtime.Identity()
	mockedInvocation := invocation.NewMockedInvocation()

	logResponse(GenericResponse{
		Type:     GENERIC_RESPONSE_TYPE_PLUGIN_READY,
		Response: map[string]any{"info": "plugin loaded"},
	}, responseFormat, client)

	for scanner.Scan() {
		payload := scanner.Bytes()

		logResponse(GenericResponse{
			Type:     GENERIC_RESPONSE_TYPE_INFO,
			Response: map[string]any{"info": "received request"},
		}, responseFormat, client)

		invokePayload, err := utils.UnmarshalJsonBytes[InvokePluginPayload](payload)
		if err != nil {
			logResponse(GenericResponse{
				InvokeId: invokePayload.InvokeId,
				Type:     GENERIC_RESPONSE_TYPE_ERROR,
				Response: map[string]any{"error": err.Error()},
			}, responseFormat, client)
			continue
		}

		if invokePayload.Action == "" || invokePayload.Type == "" {
			logResponse(GenericResponse{
				InvokeId: invokePayload.InvokeId,
				Type:     GENERIC_RESPONSE_TYPE_ERROR,
				Response: map[string]any{"error": "action and type are required"},
			}, responseFormat, client)
			continue
		}

		session := session_manager.NewSession(
			session_manager.SessionPayload{
				UserID:                 userId,
				TenantID:               tenantId,
				PluginUniqueIdentifier: pluginUniqueIdentifier,
				AccessType:             invokePayload.Type,
				AccessAction:           invokePayload.Action,
				Declaration:            declaration,
				BackwardsInvocation:    mockedInvocation,
				IgnoreCache:            true,
			},
		)

		// RunOnceWithSession
		stream, err := testing_utils.RunOnceWithSession[map[string]any, map[string]any](
			runtime,
			session,
			invokePayload.Request,
		)

		if err != nil {
			logResponse(GenericResponse{
				Type:     GENERIC_RESPONSE_TYPE_ERROR,
				InvokeId: invokePayload.InvokeId,
				Response: map[string]any{"error": err.Error()},
			}, responseFormat, client)
			continue
		}

		utils.Submit(nil, func() {
			for stream.Next() {
				response, err := stream.Read()
				if err != nil {
					logResponse(GenericResponse{
						Type:     GENERIC_RESPONSE_TYPE_ERROR,
						InvokeId: invokePayload.InvokeId,
						Response: map[string]any{"error": err.Error()},
					}, responseFormat, client)
					continue
				}

				logResponse(GenericResponse{
					Type:     GENERIC_RESPONSE_TYPE_PLUGIN_RESPONSE,
					InvokeId: invokePayload.InvokeId,
					Response: response,
				}, responseFormat, client)
			}

			logResponse(GenericResponse{
				Type:     GENERIC_RESPONSE_TYPE_PLUGIN_INVOKE_END,
				InvokeId: invokePayload.InvokeId,
				Response: map[string]any{"info": "plugin invoke end"},
			}, responseFormat, client)
		})
	}
}
