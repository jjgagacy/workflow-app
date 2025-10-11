package local_runtime

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/constants"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func init() {
	utils.InitPool(100)
}

func TestLocalPluginRuntimeStartPlugin(t *testing.T) {
	t.Run("start nodejs plugin and communicate", func(t *testing.T) {
		runtime := setupTestRuntime(t, "node", "../../plugin_packager/decoder/test_data/test_start_plugin.js")

		errCh := make(chan error, 1)
		go func() {
			errCh <- runtime.StartPlugin()
		}()

		// 等待启动
		select {
		case <-runtime.WaitStarted():
			t.Log("Node.js plugin started successfully")
		case <-time.After(5 * time.Second):
			t.Fatal("Timeout waiting for Node.js plugin to start")
		}

		// 测试通信
		listener := runtime.Listen("node-session")
		infoCmd := createSessionMessage("node-session", plugin_entities.SESSION_MESSAGE_TYPE_INVOKE, map[string]any{
			"command": "info",
		})

		runtime.Write("node-session", access_types.PLUGIN_ACCESS_ACTION_INVOKE_TOOL, infoCmd)

		type infoStream struct {
			NodeVersion string         `json:"nodeVersion"`
			Platform    string         `json:"platform"`
			Pid         uint           `json:"pid"`
			Memory      map[string]any `json:"memory"`
		}

		// 等待信息响应
		listener.Listen(func(messageData plugin_entities.SessionMessage) {
			if messageData.Type == "stream" {
				var info infoStream
				err := json.Unmarshal(messageData.Data, &info)
				assert.NoError(t, err)
				t.Logf("Received stream data: %v", info)
			} else {
				t.Logf("Received node info: %v", messageData)
			}
		})

		time.Sleep(3 * time.Second)
		// 停止插件
		runtime.Stop()
	})
}

func createSessionMessage(sessionId string, messageType plugin_entities.SessionMessageType, data map[string]any) []byte {
	messageData := map[string]any{
		"type": messageType,
		"data": data,
	}
	eventData := map[string]any{
		"event":      "session",
		"session_id": sessionId,
		"data":       messageData,
	}
	dataBytes, _ := json.Marshal(eventData)
	return dataBytes
}

func setupTestRuntime(t *testing.T, language, entryPoint string) *LocalPluginRuntime {
	config := LocalPluginRuntimeConfig{
		StdoutBufferSize:      4096, // 4KB
		StdoutMaxBufferSize:   1024 * 1024,
		PythonInterpreterPath: "/usr/bin/python3",
		UvPath:                "/opt/homebrew/bin/uv",
		PythonEnvInitTimeout:  300,
	}

	runtime := NewLocalPluginRuntime(config)

	var lang constants.Language
	switch language {
	case "python":
		lang = constants.Python
	case "node":
		lang = constants.Node
		runtime.nodeExecutePath = "/usr/local/bin/node"
	default:
		t.Fatalf("Unsupported language: %s", language)
	}

	runtime.Config = plugin_entities.PluginDeclaration{
		PluginDeclarationBaseFields: plugin_entities.PluginDeclarationBaseFields{
			Author:  "alex",
			Name:    fmt.Sprintf("test-%s-plugin", language),
			Version: "1.0.0",
			Meta: plugin_entities.PluginMeta{
				Arch: []constants.Arch{constants.AMD64, constants.ARM64},
				Runner: plugin_entities.PluginRunner{
					Language:   lang,
					EntryPoint: entryPoint,
				},
			},
		},
	}

	cwd, err := os.Getwd()
	require.NoError(t, err)
	runtime.State.WorkingPath = cwd

	return runtime
}
