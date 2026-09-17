package debugging_runtime

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (r *RemotePluginRuntime) InitEnvironment() error {
	return nil
}

func (r *RemotePluginRuntime) Stopped() bool {
	return !r.alive
}

func (r *RemotePluginRuntime) Stop() {
	r.alive = false
	if r.conn == nil {
		return
	}
	r.conn.Close()
	r.conn = nil
}

func (r *RemotePluginRuntime) Type() plugin_entities.PluginRuntimeType {
	return plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
}

func (r *RemotePluginRuntime) StartPlugin() error {
	var exitError error

	identity, err := r.Identity()
	if err != nil {
		return err
	}

	// handle heartbeat
	utils.Submit(map[string]string{
		"module":    "debugging_runtime",
		"function":  "StartPlugin",
		"plugin_id": identity.String(),
	}, func() {
		r.lastActiveAt = time.Now()
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if time.Since(r.lastActiveAt) > 60*time.Second {
					r.conn.Close()
					exitError = ErrPluginNotActive
					return
				}
			case <-r.shutdownChan:
				return
			}
		}
	})

	r.response.Async(func(data []byte) {
		plugin_entities.ParsePluginUniversalEvent(
			data,
			"",
			func(sessionId string, data []byte) {
				r.messageCallbacksLock.RLock()
				callbacks, exists := r.messageCallbacks[sessionId]
				r.messageCallbacksLock.RUnlock()
				if exists {
					for _, callback := range callbacks {
						callback(data)
					}
				}
			},
			func() {
				r.lastActiveAt = time.Now()
			},
			func(err string) {
				utils.Error("plugin %s: %s", r.Configuration().Identity(), err)
			},
			func(message string) {
				utils.Info("plugin %s: %s", r.Configuration().Identity(), message)
			},
		)
	})
	return exitError
}

func (r *RemotePluginRuntime) Wait() (<-chan bool, error) {
	return r.shutdownChan, nil
}

func (r *RemotePluginRuntime) Checksum() (string, error) {
	return r.checksum, nil
}
