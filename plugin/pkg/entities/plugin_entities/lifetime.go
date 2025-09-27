package plugin_entities

import (
	"time"
)

type PluginFullDuplexLifetime interface {
	PluginLifetime

	// Init init the environment before plugin starts
	Init() error
	// Stop stop the plugin
	Stop()
	// StartPlugin start the plugin
	StartPlugin() error
	// Wait wait for the plugin stops
	Wait() (<-chan bool, error)
	// Cleanup cleanup the plugin runtime
	Cleanup()
	// SetActive set the plugin active
	SetActive()
	// SetLaunching set the plugin launching
	SetLaunching()
	// SetRestarting set the plugin restarting
	SetRestarting()
	// SetPending set the plugin pending
	SetPending()
	// SetActiveAt set the plugin active time
	SetActiveAt(t time.Time)
	// SetScheduleAt set the plugin scheduled time
	SetScheduleAt(t time.Time)
	// AddRestarts the plugin restarts
	AddRestarts()
	// WaitStarted
	WaitStarted() <-chan bool
	// WaitStopped
	WaitStopped() <-chan bool
	// TriggerStop
	TriggerStop()
	// IsStop
	Stopped() bool
}

// PluginRuntime implement PluginRuntimeInterface

func (r *PluginRuntime) Init() error {
	r.State = PluginRuntimeState{
		Restarts:   0,
		Status:     string(PLUGIN_RUNTIME_STATUS_PENDING),
		ActiveAt:   nil,
		StoppedAt:  nil,
		Verified:   false,
		ScheduleAt: nil,
		Logs:       []string{},
	}
	return nil
}

func (r *PluginRuntime) SetActive() {
	r.State.Status = string(PLUGIN_RUNTIME_STATUS_ACTIVE)
}

func (r *PluginRuntime) SetLaunching() {
	r.State.Status = string(PLUGIN_RUNTIME_STATUS_LAUNCHING)
}

func (r *PluginRuntime) SetRestarting() {
	r.State.Status = string(PLUGIN_RUNTIME_STATUS_RESTARTING)
}

func (r *PluginRuntime) SetPending() {
	r.State.Status = string(PLUGIN_RUNTIME_STATUS_PENDING)
}

func (r *PluginRuntime) SetActiveAt(t time.Time) {
	r.State.ActiveAt = &t
}

func (r *PluginRuntime) SetScheduleAt(t time.Time) {
	r.State.ScheduleAt = &t
}

func (r *PluginRuntime) AddRestarts() {
	r.State.Restarts++
}

func (r *PluginRuntime) Stop() {
	r.State.Status = string(PLUGIN_RUNTIME_STATUS_STOPPED)
}

func (r *PluginRuntime) OnStop(f func()) {
	r.onStop = append(r.onStop, f)
}

func (r *PluginRuntime) TriggerStop() {
	for _, f := range r.onStop {
		f()
	}
}

func (r *PluginRuntime) RuntimeState() PluginRuntimeState {
	return r.State
}

func (r *PluginRuntime) UpdateScheduledAt(t time.Time) {
	r.State.ScheduleAt = &t
}

func (r *PluginRuntime) Stopped() bool {
	return r.State.Status == string(PLUGIN_RUNTIME_STATUS_STOPPED)
}

func NewPluginRuntime(config PluginDeclaration) *PluginRuntime {
	return nil
}
