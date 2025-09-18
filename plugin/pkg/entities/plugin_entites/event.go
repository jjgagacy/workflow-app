package plugin_entites

import (
	"encoding/json"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type PluginEventType string

const (
	PLUGIN_EVENT_LOG       PluginEventType = "log"
	PLUGIN_EVENT_SESSION   PluginEventType = "session"
	PLUGIN_EVENT_ERROR     PluginEventType = "error"
	PLUGIN_EVENT_HEARTBEAT PluginEventType = "heartbeat"
)

type SessionMessageType string

const (
	SESSION_MESSAGE_TYPE_STREAM SessionMessageType = "stream"
	SESSION_MESSAGE_TYPE_END    SessionMessageType = "end"
	SESSION_MESSAGE_TYPE_ERROR  SessionMessageType = "error"
	SESSION_MESSAGE_TYPE_INVOKE SessionMessageType = "invoke"
)

type PluginLogEvent struct {
	Level     string  `json:"level"`
	Message   string  `json:"message"`
	Timestamp float64 `json:"timestamp"`
}

type SessionMessage struct {
	Type SessionMessageType `json:"type" validate:"required"`
	Data json.RawMessage    `json:"data" validate:"required"`
}

type ErrorResponse struct {
	Message   string         `json:"message"`
	ErrorType string         `json:"error_type"`
	Args      map[string]any `json:"args" validate:"omitempty,max=10"` // max 10 args
}

func (e *ErrorResponse) Error() string {
	return utils.MarshalJson(map[string]any{
		"message":    e.Message,
		"error_type": e.ErrorType,
		"args":       e.Args,
	})
}
