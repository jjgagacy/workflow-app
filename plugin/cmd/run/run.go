package run

import (
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/local_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/core/testing_utils"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
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

	tempDir := os.TempDir()
	dir, err := os.MkdirTemp(tempDir, "plugin-run-*")
	if err != nil {
		return errors.Join(err, fmt.Errorf("create temp directory error"))
	}
	defer testing_utils.ClearTestingPath(dir)

	// remove the temp directory when the program shuts down
	setupSignalHandler(dir)

	// decode the plugin zip file
	pluginFile, err := os.ReadFile(payload.PluginPath)
	if err != nil {
		return errors.Join(err, fmt.Errorf("read plugin zip file error"))
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
		// create a stream of clients
	case RUN_MODE_TCP:
		// todo
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
}
