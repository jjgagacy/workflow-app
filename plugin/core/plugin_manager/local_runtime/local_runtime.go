package local_runtime

import (
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type LocalPluginRuntime struct {
	basic_runtime.BasicChecksum
	plugin_entities.PluginRuntime

	waitChan chan bool

	HttpProxy  string
	HttpsProxy string
	NoProxy    string

	waitChanLock  sync.Mutex
	waitStartChan []chan bool
	waitStopChan  []chan bool

	stdoutBufferSize    int
	stdoutMaxBufferSize int

	isNotFirstStart bool
	stdioHolder     *stdioHolder
}

// AddRestarts implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).AddRestarts of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) AddRestarts() {
	panic("unimplemented")
}

// Cleanup implements plugin_entities.PluginFullDuplexLifetime.
func (r *LocalPluginRuntime) Cleanup() {
	panic("unimplemented")
}

// Init implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).Init of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Init() error {
	panic("unimplemented")
}

// SetActive implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetActive of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetActive() {
	panic("unimplemented")
}

// SetActiveAt implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetActiveAt of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetActiveAt(t time.Time) {
	panic("unimplemented")
}

// SetLaunching implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetLaunching of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetLaunching() {
	panic("unimplemented")
}

// SetPending implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetPending of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetPending() {
	panic("unimplemented")
}

// SetRestarting implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetRestarting of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetRestarting() {
	panic("unimplemented")
}

// SetScheduleAt implements plugin_entities.PluginFullDuplexLifetime.
// Subtle: this method shadows the method (PluginRuntime).SetScheduleAt of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) SetScheduleAt(t time.Time) {
	panic("unimplemented")
}

// Checksum implements plugin_entities.PluginLifetime.
func (r *LocalPluginRuntime) Checksum() (string, error) {
	panic("unimplemented")
}

// Configuration implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).Configuration of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Configuration() *plugin_entities.PluginDeclaration {
	panic("unimplemented")
}

// Error implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).Error of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Error(string) {
	panic("unimplemented")
}

// HashedIdentity implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).HashedIdentity of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) HashedIdentity() (string, error) {
	panic("unimplemented")
}

// Identity implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).Identity of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Identity() (plugin_entities.PluginUniqueIdentifier, error) {
	panic("unimplemented")
}

// Log implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).Log of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Log(string) {
	panic("unimplemented")
}

// Warn implements plugin_entities.PluginLifetime.
// Subtle: this method shadows the method (PluginRuntime).Warn of LocalPluginRuntime.PluginRuntime.
func (r *LocalPluginRuntime) Warn(string) {
	panic("unimplemented")
}

type LocalPluginRuntimeConfig struct {
	HttpProxy           string
	HttpsProxy          string
	NoProxy             string
	StdoutBufferSize    int
	StdoutMaxBufferSize int
}

func NewLocalPluginRuntime(config LocalPluginRuntimeConfig) *LocalPluginRuntime {
	return &LocalPluginRuntime{
		HttpProxy:           config.HttpProxy,
		HttpsProxy:          config.HttpsProxy,
		NoProxy:             config.NoProxy,
		stdoutBufferSize:    config.StdoutBufferSize,
		stdoutMaxBufferSize: config.StdoutMaxBufferSize,
	}
}
