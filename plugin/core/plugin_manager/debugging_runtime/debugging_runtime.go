package debugging_runtime

import (
	"bytes"
	"sync"
	"sync/atomic"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/panjf2000/gnet/v2"
)

type RemotePluginRuntime struct {
	basic_runtime.MediaTransport
	plugin_entities.PluginRuntime

	conn   gnet.Conn
	closed int32

	response *utils.Stream[[]byte]

	// hand shake
	handshake       bool
	handshakeFailed bool

	initialized bool
	alive       bool
	checksum    string

	tenantId string

	// registration transferred
	registrationTransferred bool

	toolsRegistrationTransferred         bool
	modelsRegistrationTransferred        bool
	endpointsRegistrationTransferred     bool
	agentStrategyRegistrationTransferred bool
	assetsTransferred                    bool

	// installation id
	installationId string

	// wait for started event
	waitChanLock         sync.Mutex
	waitStartedChan      []chan bool
	waitStoppedChan      []chan bool
	waitLaunchedChan     chan error
	waitLaunchedChanOnce sync.Once

	// messageCallbacks for each session
	messageCallbacks     map[string][]func([]byte)
	messageCallbacksLock *sync.RWMutex

	// sessionMessageCloser for each session
	sessionMessageClosers     map[string][]func()
	sessionMessageClosersLock *sync.RWMutex

	// channel to notify all waiting routines
	shutdownChan chan bool

	// heartbeat
	lastActiveAt time.Time

	assets      map[string]*bytes.Buffer
	assetsBytes int64

	maxConn     int32
	currentConn int32
}

func (r *RemotePluginRuntime) addMessageCallbackHandler(sessionId string, fn func([]byte)) {
	r.messageCallbacksLock.Lock()
	defer r.messageCallbacksLock.Unlock()

	if r.messageCallbacks == nil {
		r.messageCallbacks = make(map[string][]func([]byte))
	}

	r.messageCallbacks[sessionId] = append(r.messageCallbacks[sessionId], fn)
}

func (r *RemotePluginRuntime) removeMessageCallbackHandler(sessionId string) {
	r.messageCallbacksLock.Lock()
	defer r.messageCallbacksLock.Unlock()

	delete(r.messageCallbacks, sessionId)
}

func (r *RemotePluginRuntime) addSessionMessageCloser(sessionId string, fn func()) {
	r.sessionMessageClosersLock.Lock()
	defer r.sessionMessageClosersLock.Unlock()

	if r.sessionMessageClosers == nil {
		r.sessionMessageClosers = make(map[string][]func())
	}

	r.sessionMessageClosers[sessionId] = append(r.sessionMessageClosers[sessionId], fn)
}

func (r *RemotePluginRuntime) removeSessionMessageCloser(sessionId string) {
	r.sessionMessageClosersLock.Lock()
	defer r.sessionMessageClosersLock.Unlock()

	delete(r.sessionMessageClosers, sessionId)
}

func (r *RemotePluginRuntime) onDisconnected() {
	r.sessionMessageClosersLock.RLock()
	defer r.sessionMessageClosersLock.RUnlock()

	for sessionId, closers := range r.sessionMessageClosers {
		for _, closer := range closers {
			closer()
		}
		delete(r.sessionMessageClosers, sessionId)
	}

	r.alive = false
	atomic.StoreInt32(&r.closed, 1)

	close(r.shutdownChan)
	r.response.Close()
}
