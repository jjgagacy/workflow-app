package debugging_runtime

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/media_transport"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/panjf2000/gnet/v2"
	gnet_errors "github.com/panjf2000/gnet/v2/pkg/errors"
)

type DebuggingPluginServer struct {
	gnet.BuiltinEventEngine
	engine gnet.Engine

	mediaManager *media_transport.MediaBucket

	// listening
	addr string
	port uint16

	// enabled multicore
	multicore bool
	// event loop count
	numLoops int

	// read new connections
	response *utils.Stream[plugin_entities.PluginFullDuplexLifetime]

	plugins map[int]*RemotePluginRuntime
	mu      *sync.RWMutex

	shutdownChan chan bool

	maxConn     int32
	currentConn int32

	shutdownOnce sync.Once
}

type RemotePluginServer struct {
	server *DebuggingPluginServer
}

type RemotePluginServerInterface interface {
	Read() (plugin_entities.PluginFullDuplexLifetime, error)
	Next() bool
	Wrap(f func(plugin_entities.PluginFullDuplexLifetime))
	Stop() error
	Launch() error
}

// NewRemotePluginServer creates
func NewRemotePluginServer(config *core.Config, media_transport *media_transport.MediaBucket) *RemotePluginServer {
	addr := fmt.Sprintf(
		"tcp://%s:%d",
		config.PluginRemoteInstallingHost,
		config.PluginRemoteInstallingPort,
	)

	response := utils.NewStream[plugin_entities.PluginFullDuplexLifetime](
		config.PluginRemoteInstallingMaxConn,
	)

	s := &DebuggingPluginServer{
		mediaManager: media_transport,
		addr:         addr,
		port:         config.PluginRemoteInstallingPort,
		multicore:    true,
		numLoops:     config.PluginRemoteInstallServerEventLoopNums,
		response:     response,

		plugins:      make(map[int]*RemotePluginRuntime),
		mu:           &sync.RWMutex{},
		shutdownChan: make(chan bool),
		maxConn:      int32(config.PluginRemoteInstallingMaxConn),
		currentConn:  0,
	}

	manager := &RemotePluginServer{
		server: s,
	}
	return manager
}

func (r *RemotePluginServer) Stop() error {
	if r.server.response == nil {
		return errors.New("plugin server not started")
	}
	r.server.response.Close()
	err := r.server.engine.Stop(context.Background())
	if err == gnet_errors.ErrEmptyEngine || err == gnet_errors.ErrEngineInShutdown {
		return nil
	}

	return err
}

func (r *RemotePluginServer) collectShutdownSignal() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	<-c

	r.Stop()
}

func (r *RemotePluginServer) Read() (plugin_entities.PluginFullDuplexLifetime, error) {
	if r.server.response == nil {
		return nil, errors.New("plugin server not started")
	}
	return r.server.response.Read()
}

func (r *RemotePluginServer) Next() bool {
	if r.server.response == nil {
		return false
	}
	return r.server.response.Next()
}

func (r *RemotePluginServer) Wrap(f func(plugin_entities.PluginFullDuplexLifetime)) {
	r.server.response.Async(f)
}

// Launch the server
func (r *RemotePluginServer) Launch() error {
	// kill the
	exec.Command("fuser", "-k", "tcp", fmt.Sprintf("%d", r.server.port)).Run()

	// 给操作系统内核留出微小的缓冲时间，完成 Socket 资源的释放和回收
	time.Sleep(time.Millisecond * 100)

	// 启动 gnet 高性能网络服务
	err := gnet.Run(
		r.server,
		r.server.addr,
		gnet.WithMulticore(r.server.multicore),
		gnet.WithNumEventLoop(r.server.numLoops),
	)

	if err != nil {
		r.Stop()
	}

	// 开启协程，收集优雅退出/关机信号
	go r.collectShutdownSignal()

	return err
}
