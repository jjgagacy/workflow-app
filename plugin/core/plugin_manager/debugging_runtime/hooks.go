package debugging_runtime

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/panjf2000/gnet/v2"
)

func (s *DebuggingPluginServer) OnBoot(c gnet.Engine) (action gnet.Action) {
	s.engine = c
	return gnet.None
}

func (s *DebuggingPluginServer) OnOpen(c gnet.Conn) (out []byte, action gnet.Action) {
	c.SetContext(&codec{})
	runtime := &RemotePluginRuntime{
		MediaTransport: basic_runtime.NewMediaTransport(
			s.mediaManager,
		),

		conn:                      c,
		response:                  utils.NewStream[[]byte](512),
		messageCallbacks:          make(map[string][]func([]byte)),
		messageCallbacksLock:      &sync.RWMutex{},
		sessionMessageClosers:     make(map[string][]func()),
		sessionMessageClosersLock: &sync.RWMutex{},

		shutdownChan:     make(chan bool),
		waitLaunchedChan: make(chan error),

		assets:      make(map[string]*bytes.Buffer),
		assetsBytes: 0,

		alive: true,
	}

	s.mu.Lock()
	s.plugins[c.Fd()] = runtime
	s.mu.Unlock()

	// start a timer to check if handshake is completed in 10 seconds
	time.AfterFunc(time.Second*10, func() {
		if !runtime.handshake {
			c.Close()
		}
	})

	return nil, gnet.None
}

func (s *DebuggingPluginServer) OnShutdown(c gnet.Engine) {
	s.shutdownOnce.Do(func() {
		if s.shutdownChan != nil {
			close(s.shutdownChan)
		}
	})
}

func (s *DebuggingPluginServer) OnClose(c gnet.Conn, err error) (action gnet.Action) {
	s.mu.Lock()
	plugin := s.plugins[c.Fd()]
	delete(s.plugins, c.Fd())
	s.mu.Unlock()

	if plugin == nil {
		return gnet.None
	}

	// close plugin
	plugin.onDisconnected()

	// uninstall plugin
	if plugin.assetsTransferred {
		if plugin.installationId != "" {
			if err := plugin.Unregister(); err != nil {
				utils.Error("unregister plugin failed, error: %v", err)
			}
		}
		// decrease the current connection count
		atomic.AddInt32(&s.currentConn, -1)
	}

	// send stopped event
	plugin.waitChanLock.Lock()
	for _, ch := range plugin.waitStoppedChan {
		select {
		case ch <- true:
		default:
		}
	}
	plugin.waitChanLock.Unlock()

	// avoid memory leak
	// 外部可能有多个协程正阻塞在 <-plugin.waitLaunchedChan 处
	plugin.waitLaunchedChanOnce.Do(func() {
		close(plugin.waitLaunchedChan)
	})

	return gnet.None
}

func (s *DebuggingPluginServer) OnTraffic(c gnet.Conn) (action gnet.Action) {
	codec := c.Context().(*codec)
	messages, err := codec.Decode(c)
	if err != nil {
		return gnet.Close
	}
	// get plugin runtime
	s.mu.RLock()
	runtime, ok := s.plugins[c.Fd()]
	s.mu.RUnlock()
	if !ok {
		return gnet.Close
	}
	if runtime == nil {
		return gnet.Close
	}

	for _, message := range messages {
		if len(message) == 0 {
			continue
		}
		s.onMessage(runtime, message)
	}
	return gnet.None
}

func (s *DebuggingPluginServer) onMessage(runtime *RemotePluginRuntime, message []byte) {
	if runtime.handshakeFailed {
		return
	}

	closeConn := func(message []byte) {
		if atomic.CompareAndSwapInt32(&runtime.closed, 0, 1) {
			runtime.conn.Write(message)
			runtime.conn.Close()
		}
	}

	if !runtime.initialized {
		payload, err := utils.UnmarshalJsonBytes[plugin_entities.RemotePluginPayload](message)
		if err != nil {
			closeConn([]byte("handshake failed, invalid handshake message"))
			runtime.handshakeFailed = true
			return
		}
		switch payload.Type {
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_HANDSHAKE:
			if runtime.handshake {
				return
			}
			key, err := utils.UnmarshalJsonBytes[plugin_entities.RemotePluginHandshake](payload.Data)
			if err != nil {
				closeConn([]byte("handshake failed, invalid handshake message"))
				runtime.handshakeFailed = true
				return
			}
			info, err := GetConnectionInfo(key.Key)
			if err == cache.ErrNotFound {
				closeConn([]byte("handshake failed, connection info not found"))
				runtime.handshakeFailed = true
				return
			} else if err != nil {
				closeConn([]byte("handshake failed, connection info error"))
				runtime.handshakeFailed = true
				return
			}
			runtime.tenantId = info.TenantId
			runtime.handshake = true
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_ASSET_CHUNK:
			if runtime.assetsTransferred {
				return
			}
			// connection was closed as expected
			assetChunk, err := utils.UnmarshalJsonBytes[plugin_entities.RemotePluginAssetChunk](payload.Data)
			if err != nil {
				utils.Error("assets register failed, error: %v", err)
				closeConn([]byte("asset chunk failed, invalid asset chunk message"))
				return
			}
			buffer, ok := runtime.assets[assetChunk.Filename]
			if !ok {
				runtime.assets[assetChunk.Filename] = &bytes.Buffer{}
			}
			buffer = runtime.assets[assetChunk.Filename]
			// allows at most 50MB
			if runtime.assetsBytes+int64(len(assetChunk.Data)) > 50*1024*1024 {
				closeConn([]byte("asset chunk failed, asset size exceeds 50MB"))
				return
			}
			// decode as base64
			data, err := base64.StdEncoding.DecodeString(string(assetChunk.Data))
			if err != nil {
				utils.Error("asset decode failed, error: %v", err)
				closeConn([]byte("asset decode failed, invalid assets data"))
				return
			}
			buffer.Write(data)
			runtime.assetsBytes += int64(len(data))
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_END:
			if !runtime.modelsRegistrationTransferred &&
				!runtime.endpointsRegistrationTransferred &&
				!runtime.toolsRegistrationTransferred &&
				!runtime.agentStrategyRegistrationTransferred {
				closeConn([]byte("no registration transferred, cannot initialize\n"))
				return
			}
			files := make(map[string][]byte)
			for filename, buffer := range runtime.assets {
				files[filename] = buffer.Bytes()
			}
			// remap assets
			if err := runtime.RemapAssets(&runtime.Config, files); err != nil {
				utils.Error("remap assets failed, error: %v", err)
				closeConn([]byte("remap assets failed, error occurred"))
				return
			}

			atomic.AddInt32(&s.currentConn, 1)
			if atomic.LoadInt32(&s.currentConn) > s.maxConn {
				atomic.AddInt32(&s.currentConn, -1)
				closeConn([]byte("maximum connection limit reached" + fmt.Sprintf("%d %d", atomic.LoadInt32(&s.currentConn), s.maxConn)))
				return
			}
			// fill the default
			runtime.Config.FillInDefaultValues()
			runtime.assetsTransferred = true
			runtime.checksum = runtime.CalculateChecksum(files)

			runtime.InitState()
			runtime.SetActiveAt(time.Now())

			// trigger registration complete event
			if err := runtime.Register(); err != nil {
				closeConn(fmt.Appendf(nil, "registration failed, error occurred: %v", err))
				return
			}

			// send started event
			runtime.waitChanLock.Lock()
			for _, c := range runtime.waitStartedChan {
				select {
				case <-c:
				default:
				}
			}
			runtime.waitChanLock.Unlock()

			// notify launched
			runtime.waitLaunchedChanOnce.Do(func() {
				if runtime.waitLaunchedChan != nil {
					close(runtime.waitLaunchedChan)
				}
			})

			runtime.initialized = true
			// public runtime to watcher
			s.response.Write(runtime)
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_AGENT_STRATEGY_DECLARATION:
			if runtime.agentStrategyRegistrationTransferred {
				return
			}
			agents, err := utils.UnmarshalJsonBytes[[]plugin_entities.AgentStrategyProviderDeclaration](payload.Data)
			if err != nil {
				closeConn([]byte(fmt.Sprintf("failed to unmarshal agent strategy declaration, error occurred: %v\n", err)))
				return
			}
			if len(agents) > 0 {
				declaration := runtime.Config
				declaration.AgentStrategy = &agents[0]
				runtime.Config = declaration
			}
			runtime.agentStrategyRegistrationTransferred = true
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_ENDPOINT_DECLARATION:
			if runtime.endpointsRegistrationTransferred {
				return
			}
			endpoints, err := utils.UnmarshalJsonBytes[[]plugin_entities.EndPointProviderDeclaration](payload.Data)
			if err != nil {
				closeConn(fmt.Appendf(nil, "failed to unmarshal endpoint declaration, error occurred: %v\n", err))
				return
			}
			runtime.endpointsRegistrationTransferred = true
			if len(endpoints) > 0 {
				declaration := runtime.Config
				declaration.EndPoint = &endpoints[0]
				runtime.Config = declaration
			}
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_MODEL_DECLARATION:
			if runtime.modelsRegistrationTransferred {
				return
			}
			models, err := utils.UnmarshalJsonBytes[[]plugin_entities.ModelProviderDeclaration](payload.Data)
			if err != nil {
				closeConn(fmt.Appendf(nil, "failed to unmarshal model declaration, error occurred: %v\n", err))
				return
			}
			runtime.modelsRegistrationTransferred = true
			if len(models) > 0 {
				declaration := runtime.Config
				declaration.Model = &models[0]
				runtime.Config = declaration
			}
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_TOOL_DECLARATION:
			if runtime.toolsRegistrationTransferred {
				return
			}
			tools, err := utils.UnmarshalJsonBytes[[]plugin_entities.ToolProviderDeclaration](payload.Data)
			if err != nil {
				closeConn(fmt.Appendf(nil, "failed to unmarshal tool declaration, error occurred: %v\n", err))
				return
			}
			runtime.toolsRegistrationTransferred = true
			if len(tools) > 0 {
				declaration := runtime.Config
				declaration.Tool = &tools[0]
				runtime.Config = declaration
			}
		case plugin_entities.REMOTE_PLUGIN_EVENT_TYPE_MANIFEST_DECLARATION:
			if runtime.registrationTransferred {
				return
			}

			declaration, err := utils.UnmarshalJsonBytes[plugin_entities.PluginDeclaration](payload.Data)
			if err != nil {
				closeConn(fmt.Appendf(nil, "failed to unmarshal plugin declaration, error occurred: %v\n", err))
				return
			}
			runtime.Config = declaration
			runtime.registrationTransferred = true
		}

	} else {
		runtime.response.WriteBlocking(message)
	}
}
