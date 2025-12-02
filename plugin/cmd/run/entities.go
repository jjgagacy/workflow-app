package run

import (
	"context"
	"io"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
)

type RunMode string

const (
	RUN_MODE_STDIO RunMode = "stdio"
	RUN_MODE_TCP   RunMode = "tcp"
)

type RunPluginPayload struct {
	PluginPath string
	RunMode    RunMode

	EnableLogs bool

	TcpServerHost string
	TcpServerPort int

	ResponseFormat string
	ZipFilePlugin  bool
}

type GenericResponseType = string

const (
	GENERIC_RESPONSE_TYPE_INFO              GenericResponseType = "info"
	GENERIC_RESPONSE_TYPE_PLUGIN_READY      GenericResponseType = "plugin_ready"
	GENERIC_RESPONSE_TYPE_ERROR             GenericResponseType = "error"
	GENERIC_RESPONSE_TYPE_PLUGIN_RESPONSE   GenericResponseType = "plugin_response"
	GENERIC_RESPONSE_TYPE_PLUGIN_INVOKE_END GenericResponseType = "plugin_invoke_end"
)

type GenericResponse struct {
	InvokeId string              `json:"invoke_id"`
	Type     GenericResponseType `json:"type"`

	Response map[string]any `json:"response"`
}

type client struct {
	reader io.Reader
	writer io.Writer
	cancel context.CancelFunc
}

type InvokePluginPayload struct {
	InvokeId string                          `json:"invoke_id"`
	Type     access_types.PluginAccessType   `json:"type"`
	Action   access_types.PluginAccessAction `json:"action"`

	Request map[string]any `json:"request"`
}
