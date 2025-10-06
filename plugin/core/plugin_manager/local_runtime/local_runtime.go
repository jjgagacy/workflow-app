package local_runtime

import (
	"fmt"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/constants"
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

	nodeExecutePath    string
	nodeEnvInitTimeout int
	nodeExtraArg       string

	pythonInterpreterPath  string
	pythonEnvInitTimeout   int
	pythonCompileExtraArgs string

	defaultPythonInterpreterPath string
	uvPath                       string

	pipMirrorUrl    string
	pipPreferBinary bool
	pipVerbose      bool
	pipExtraArgs    string

	waitChanLock  sync.Mutex
	waitStartChan []chan bool
	waitStopChan  []chan bool

	stdoutBufferSize    int
	stdoutMaxBufferSize int

	isNotFirstStart bool
	stdioHolder     *stdioHolder
}

func (r *LocalPluginRuntime) RuntimeState() plugin_entities.PluginRuntimeState {
	return r.State
}

func (r *LocalPluginRuntime) UpdateScheduleAt(t time.Time) {
	r.State.ScheduleAt = &t
}

func (r *LocalPluginRuntime) AddRestarts() {
	r.State.Restarts++
}

func (r *LocalPluginRuntime) Init() error {
	var err error
	switch r.Config.Meta.Runner.Language {
	case constants.Node:
		err = r.InitNode()
	case constants.Python:
		err = r.InitPython()
	default:
		return fmt.Errorf("unsupported language: %s", r.Config.Meta.Runner.Language)
	}

	if err != nil {
		return err
	}

	return nil
}

func (r *LocalPluginRuntime) Identity() (plugin_entities.PluginUniqueIdentifier, error) {
	checksum, err := r.Checksum()
	if err != nil {
		return "", err
	}
	return plugin_entities.NewPluginUniqueIdentifier(fmt.Sprintf("%s@%s", r.Config.Identity(), checksum))
}

func (r *LocalPluginRuntime) SetActive() {
	r.State.Status = plugin_entities.PLUGIN_RUNTIME_STATUS_ACTIVE.String()
}

func (r *LocalPluginRuntime) SetActiveAt(t time.Time) {
	r.State.ActiveAt = &t
}

func (r *LocalPluginRuntime) SetLaunching() {
	r.State.Status = plugin_entities.PLUGIN_RUNTIME_STATUS_LAUNCHING.String()
}

func (r *LocalPluginRuntime) SetPending() {
	r.State.Status = plugin_entities.PLUGIN_RUNTIME_STATUS_PENDING.String()
}

func (r *LocalPluginRuntime) SetRestarting() {
	r.State.Status = plugin_entities.PLUGIN_RUNTIME_STATUS_RESTARTING.String()
}

func (r *LocalPluginRuntime) SetScheduleAt(t time.Time) {
	r.State.ScheduleAt = &t
}

type LocalPluginRuntimeConfig struct {
	HttpProxy           string
	HttpsProxy          string
	NoProxy             string
	StdoutBufferSize    int
	StdoutMaxBufferSize int

	PythonInterpreterPath  string
	UvPath                 string
	PythonEnvInitTimeout   int
	PythonCompileExtraArgs string
}

func NewLocalPluginRuntime(config LocalPluginRuntimeConfig) *LocalPluginRuntime {
	return &LocalPluginRuntime{
		defaultPythonInterpreterPath: config.PythonInterpreterPath,
		uvPath:                       config.UvPath,
		pythonEnvInitTimeout:         config.PythonEnvInitTimeout,
		pythonCompileExtraArgs:       config.PythonCompileExtraArgs,
		HttpProxy:                    config.HttpProxy,
		HttpsProxy:                   config.HttpsProxy,
		NoProxy:                      config.NoProxy,
		stdoutBufferSize:             config.StdoutBufferSize,
		stdoutMaxBufferSize:          config.StdoutMaxBufferSize,
	}
}
