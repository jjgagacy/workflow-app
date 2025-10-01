package plugin_entities

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

type PluginUniversalEvent struct {
	SessionId string          `json:"session_id"`
	Event     PluginEventType `json:"event"`
	Data      json.RawMessage `json:"data"`
}

// ParsePluginUniversalEvent parses bytes into struct contains basic info of a message
func ParsePluginUniversalEvent(
	data []byte,
	statusText string,
	sessionHandler func(sessionId string, data []byte),
	heartbeatHandler func(),
	errorHandler func(err string),
	infoHandler func(message string),
) {
	// handle event
	event, err := utils.UnmarshalJsonBytes[PluginUniversalEvent](data)
	if err != nil {
		if len(data) > 1024 {
			errorHandler(err.Error() + " status: " + statusText + " original response: " + string(data[:1024]) + "...")
		} else {
			errorHandler(err.Error() + " status: " + statusText + " original response: " + string(data))
		}
		return
	}

	sessionId := event.SessionId

	switch event.Event {
	case PLUGIN_EVENT_LOG:
		logEvent, err := utils.UnmarshalJsonBytes[PluginLogEvent](event.Data)
		if err != nil {
			utils.Error("unmarshal json failed: %s", err.Error())
			return
		}
		infoHandler(logEvent.Message)
	case PLUGIN_EVENT_SESSION:
		sessionHandler(sessionId, event.Data)
	case PLUGIN_EVENT_ERROR:
		errorHandler(string(event.Data))
	case PLUGIN_EVENT_HEARTBEAT:
		heartbeatHandler()
	}
}
