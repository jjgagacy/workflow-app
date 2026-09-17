package debugging_runtime

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/constants"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/media_transport"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/oss/factory"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

func loadEnvFromProjectRoot() {
	dir, err := os.Getwd()
	if err != nil {
		return // 无法获取当前工作目录
	}

	for {
		for _, name := range []string{".env", ".env.dev", ".env.test"} {
			path := filepath.Join(dir, name)
			if _, statErr := os.Stat(path); statErr == nil {
				_ = godotenv.Load(path)
			}
		}

		testdataPath := filepath.Join(dir, "test", "integration", "testdata", ".env.test")
		if _, statErr := os.Stat(testdataPath); statErr == nil {
			_ = godotenv.Load(testdataPath)
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break // 到达根目录
		}
		dir = parent
	}
}

func loadTestConfig() *core.Config {
	loadEnvFromProjectRoot()

	var cfg core.Config
	envconfig.Process("", &cfg)
	cfg.SetDefault()

	if err := cfg.Validate(); err != nil {
		panic(err)
	}

	return &cfg
}

var testConfig *core.Config

func init() {
	testConfig = loadTestConfig()
}

func preparePluginServer(t *testing.T) (*RemotePluginServer, uint16) {
	db.Init(testConfig)

	port, err := utils.GetFreePort()
	if err != nil {
		t.Errorf("failed to get free port: %v", err)
		return nil, 0
	}
	oss, err := factory.Load("local", oss.Args{
		Local: &oss.Local{
			Path: "./storage",
		},
	})
	if err != nil {
		t.Errorf("failed to load oss storage: %v", err)
		return nil, 0
	}

	return NewRemotePluginServer(testConfig, media_transport.NewMediaBucket(oss, "assets", 10)), port
}

func TestLaunchAndCloseServer(t *testing.T) {
	server, _ := preparePluginServer(t)
	if server == nil {
		t.Errorf("failed to prepare plugin server")
		return
	}
	doneChan := make(chan error)

	go func() {
		err := server.Launch()
		if err != nil {
			doneChan <- err
		}
	}()

	timer := time.NewTimer(time.Second * 5)
	select {
	case err := <-doneChan:
		if err != nil {
			t.Errorf("server failed to launch: %v", err)
			return
		}
	case <-timer.C:
		err := server.Stop()
		if err != nil {
			t.Errorf("failed to stop plugin serer: %v", err)
			return
		}
	}
}

func getConnection() error {
	return cache.InitRedisClient("0.0.0.0:6379", "", "", false, 0)
}

func init() {
	getConnection()
}

func TestNoHandleShakeIn10Seconds(t *testing.T) {
	server, port := preparePluginServer(t)
	if server == nil {
		t.Errorf("failed to prepare plugin server")
		return
	}
	defer server.Stop()
	go func() {
		server.Launch()
	}()

	// wait for the server to start
	time.Sleep(time.Second * 2)

	conn, err := net.Dial("tcp", fmt.Sprintf("0.0.0.0:%d", port))
	if err != nil {
		t.Errorf("failed to connect to plugin server: %s", err.Error())
		return
	}
	defer conn.Close()

	closedChan := make(chan bool)

	go func() {
		buf := make([]byte, 1024)
		for {
			_, err := conn.Read(buf)
			if err != nil {
				break
			}
		}
		close(closedChan)
	}()

	select {
	case <-closedChan:
		// connection was closed as expected
	case <-time.After(time.Second * 15):
		t.Errorf("connection was not closed after 10 seconds without handshake")
	}
}

func TestIncorrectHandleShake(t *testing.T) {
	server, port := preparePluginServer(t)
	if server == nil {
		t.Errorf("failed to prepare plugin server")
		return
	}
	defer server.Stop()
	go func() {
		server.Launch()
	}()

	go func() {
		for server.Next() {
			runtime, err := server.Read()
			if err != nil {
				t.Errorf("failed to read plugin runtime: %s", err.Error())
				return
			}

			runtime.Stop()
		}
	}()

	// wait for the server to start
	time.Sleep(time.Second * 2)

	conn, err := net.Dial("tcp", fmt.Sprintf("0.0.0.0:%d", port))
	if err != nil {
		t.Errorf("failed to connect to plugin server: %s", err.Error())
		return
	}
	defer conn.Close()

	// send incorrect handshake message
	conn.Write([]byte("incorrect handshake"))

	closedChan := make(chan bool)
	handShakeFailed := false

	go func() {
		buf := make([]byte, 1024)
		for {
			_, err := conn.Read(buf)
			if err != nil {
				break
			} else {
				if strings.Contains(string(buf), "handshake failed") {
					handShakeFailed = true
				}
			}
		}
		close(closedChan)
	}()

	select {
	case <-closedChan:
		if !handShakeFailed {
			t.Errorf("handshake did not fail as expected")
			return
		}
		return
	case <-time.After(time.Second * 10):
		t.Errorf("connection not closed normally")
		return
	}
}

// TestAcceptConnection tests if the server can accept a connection.
func TestAcceptConnection(t *testing.T) {
	tenantId := uuid.New().String()

	defer cache.Close()
	key, err := GetConnectionKey(ConnectionInfo{
		TenantId: tenantId,
	})
	if err != nil {
		t.Errorf("failed to get connection key: %v", err)
		return
	}
	defer ClearConnectionKey(key)

	server, port := preparePluginServer(t)
	if server == nil {
		t.Errorf("failed to prepare plugin server")
		return
	}
	defer server.Stop()
	go func() {
		server.Launch()
	}()

	gotConnection := false
	var connectionErr error

	go func() {
		for server.Next() {
			// runtime, err := server.Read()
			// if err != nil {
			// 	t.Errorf("failed to read plugin runtime: %s", err.Error())
			// 	return
			// }

			// remoteRuntime := runtime.(*RemotePluginRuntime)
			// fmt.Printf("%v\n", remoteRuntime)
		}
	}()

	// wait for the server to start
	time.Sleep(time.Second * 2)

	conn, err := net.Dial("tcp", fmt.Sprintf("0.0.0.0:%d", port))
	if err != nil {
		t.Errorf("failed to connect to plugin server: %s", err.Error())
		return
	}

	// handshake
	pluginManifest := utils.MarshalJsonBytes(&plugin_entities.PluginDeclaration{
		PluginDeclarationBaseFields: plugin_entities.PluginDeclarationBaseFields{
			Version: "1.0.0",
			Type:    manifest_entites.PluginType,
			Description: plugin_entities.I18nObject{
				EnUs: "test",
			},
			Author:    "alexxu",
			Name:      "test",
			IconSmall: "test.svg",
			IconLarge: "test.svg",
			Label: plugin_entities.I18nObject{
				EnUs: "test",
			},
			CreatedAt: time.Now(),
			Resource: plugin_entities.PluginResourceRequirement{
				Memory:     1,
				Permission: nil,
			},
			Plugins: plugin_entities.PluginExtensions{
				Tools: []string{
					"test",
				},
			},
			Meta: plugin_entities.PluginMeta{
				Version: "0.0.1",
				Arch: []constants.Arch{
					constants.AMD64,
				},
				Runner: plugin_entities.PluginRunner{
					Language:   constants.Python,
					Version:    "3.12",
					EntryPoint: "main",
				},
			},
		},
	})
	conn.Write(utils.MarshalJsonBytes(plugin_entities.RemotePluginPayload{
		Type: plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_HANDSHAKE,
		Data: utils.MarshalJsonBytes(plugin_entities.RemotePluginHandshake{
			Key: key,
		}),
	}))
	conn.Write([]byte("\n\n"))
	conn.Write(utils.MarshalJsonBytes(plugin_entities.RemotePluginPayload{
		Type: plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_MANIFEST_DECLARATION,
		Data: pluginManifest,
	}))
	conn.Write([]byte("\n\n"))
	conn.Write(utils.MarshalJsonBytes(plugin_entities.RemotePluginPayload{
		Type: plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_ENDPOINT_DECLARATION,
		Data: utils.MarshalJsonBytes([]plugin_entities.EndPointProviderDeclaration{
			{
				Settings: []plugin_entities.ProviderConfig{},
				EndPoints: []plugin_entities.EndPointDeclaration{
					{
						Path:   "/duck/<app_id>",
						Method: "GET",
					},
				},
			},
		}),
	}))
	conn.Write([]byte("\n\n"))
	conn.Write(utils.MarshalJsonBytes(plugin_entities.RemotePluginPayload{
		Type: plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_ASSET_CHUNK,
		Data: utils.MarshalJsonBytes(plugin_entities.RemotePluginAssetChunk{
			Filename: "test.svg",
			Data:     "AAAA",
			End:      true,
		}),
	}))
	conn.Write([]byte("\n\n"))
	conn.Write(utils.MarshalJsonBytes(plugin_entities.RemotePluginPayload{
		Type: plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_END,
		Data: []byte("{}"),
	}))
	conn.Write([]byte("\n\n"))

	closedChan := make(chan bool)
	var msg strings.Builder

	go func() {
		// block here to accept messages until the connection is closed
		buffer := make([]byte, 1024)
		for {
			n, err := conn.Read(buffer)
			if err != nil {
				break
			}
			msg.WriteString(string(buffer[:n]))
		}
		close(closedChan)
	}()

	select {
	case <-time.After(time.Second * 10):
		t.Errorf("connection not closed normally")
		return
	case <-closedChan:
		if !gotConnection {
			t.Errorf("failed to accept connection: %s", msg.String())
			return
		}
		if connectionErr != nil {
			t.Errorf("failed to accept connection: %s", connectionErr.Error())
			return
		}
		return
	}
}
