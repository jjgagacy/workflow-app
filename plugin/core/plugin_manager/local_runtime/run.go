package local_runtime

import (
	"errors"
	"os/exec"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func (r *LocalPluginRuntime) gc() {
	panic("")
}

func (r *LocalPluginRuntime) Type() plugin_entities.PluginRuntimeType {
	return plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
}

func (r *LocalPluginRuntime) getCmd() (*exec.Cmd, error) {
	panic("")
}

func (r *LocalPluginRuntime) StartPlugin() error {
	panic("")
}

// Wait returns a channel that will be closed when the plugin stops
func (r *LocalPluginRuntime) Wait() (<-chan bool, error) {
	if r.waitChan == nil {
		return nil, errors.New("plugin not started")
	}
	return r.waitChan, nil
}

// WaitStarted returns a channel that will receive true when the plugin starts
func (r *LocalPluginRuntime) WaitStarted() <-chan bool {
	c := make(chan bool)
	r.waitChanLock.Lock()
	r.waitStartChan = append(r.waitStartChan, c)
	r.waitChanLock.Unlock()
	return c
}

// WaitStopped returns a channel that will receive true when the plugins stops
func (r *LocalPluginRuntime) WaitStopped() <-chan bool {
	c := make(chan bool)
	r.waitChanLock.Lock()
	r.waitStopChan = append(r.waitStopChan, c)
	r.waitChanLock.Unlock()
	return c
}

// Stop stops the plugin
func (r *LocalPluginRuntime) Stop() {
	r.PluginRuntime.Stop()

	if r.stdioHolder != nil {
		//
	}
}

func (r *LocalPluginRuntime) Stopped() bool {
	panic("")
}

func (r *LocalPluginRuntime) Listen(sessionId string) *entities.Broadcast[plugin_entities.SessionMessage] {
	panic("")
}

func (r *LocalPluginRuntime) Write(sessionId string, action plugin_daemon.PluginAccessAction, data []byte) {
	panic("")
}
