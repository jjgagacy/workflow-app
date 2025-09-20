package plugin_entities

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
)

type PluginRuntimeType string

const (
	PLUGIN_RUNTIME_TYPE_LOCAL      PluginRuntimeType = "local"
	PLUGIN_RUNTIME_TYPE_REMOTE     PluginRuntimeType = "remote"
	PLUGIN_RUNTIME_TYPE_SERVERLESS PluginRuntimeType = "serverless"
)

type PluginRuntimeState struct {
	Restarts    int        `json:"restarts"`
	Status      string     `json:"status"`
	WorkingPath string     `json:"working_path"`
	ActiveAt    *time.Time `json:"active_at"`
	StoppedAt   *time.Time `json:"stopped_at"`
	Verified    bool       `json:"verified"`
	ScheduleAt  *time.Time `json:"scheduled_at"`
	Logs        []string   `json:"logs"`
}

type PluginRuntimeStatus string

const (
	PLUGIN_RUNTIME_STATUS_ACTIVE     PluginRuntimeStatus = "active"
	PLUGIN_RUNTIME_STATUS_LAUNCHING  PluginRuntimeStatus = "launching"
	PLUGIN_RUNTIME_STATUS_STOPPED    PluginRuntimeStatus = "stopped"
	PLUGIN_RUNTIME_STATUS_RESTARTING PluginRuntimeStatus = "restarting"
	PLUGIN_RUNTIME_STATUS_PENDING    PluginRuntimeStatus = "pending"
)

func (p PluginRuntimeStatus) String() string {
	return string(p)
}

type PluginRuntime struct {
	State     PluginRuntimeState `json:"state"`
	Config    PluginDeclaration  `json:"config"`
	onStopped []func()           `json:"-"`
}

type PluginBasicInfo interface {
	Type() PluginRuntimeType
	Configuration() *PluginDeclaration
	Identity() (PluginUniqueIdentifier, error)
	HashedIdentify() (string, error)
	Checksum() (string, error)
}

type PluginRuntimeInterface interface {
	PluginBasicInfo

	// Listen listens for messages from the plugin
	Listen(session_id string) *entities.Broadcast[SessionMessage]
	// Write writes a message to the plugin
	Write(session_id string, action plugin_daemon.PluginAccessAction, data []byte)
	// Log adds a log to the plugin runtime
	Log(string)
	// Warn adds a warning log to the plugin runtime
	Warn(string)
	// Error adds an error log to the plugin runtime
	Error(string)
}

type PluginLifetime struct {
	PluginBasicInfo
	PluginRuntimeInterface
}
