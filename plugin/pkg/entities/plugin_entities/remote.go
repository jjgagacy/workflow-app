package plugin_entities

import "encoding/json"

type RemoteAssetPayload struct {
	Filename string `json:"filename" validate:"required"`
	Data     string `json:"data" validate:"required"`
}

type RemotePluginEventType string

const (
	REMOTE_PLUGIN_EVENT_TYPE_HANDSHAKE                  RemotePluginEventType = "handshake"
	REMOTE_PLUGIN_EVENT_TYPE_ASSET_CHUNK                RemotePluginEventType = "asset_chunk"
	REMOTE_PLUGIN_EVENT_TYPE_MANIFEST_DECLARATION       RemotePluginEventType = "manifest_declaration"
	REMOTE_PLUGIN_EVENT_TYPE_TOOL_DECLARATION           RemotePluginEventType = "tool_declaration"
	REMOTE_PLUGIN_EVENT_TYPE_MODEL_DECLARATION          RemotePluginEventType = "model_declaration"
	REMOTE_PLUGIN_EVENT_TYPE_ENDPOINT_DECLARATION       RemotePluginEventType = "endpoint_declaration"
	REMOTE_PLUGIN_EVENT_TYPE_AGENT_STRATEGY_DECLARATION RemotePluginEventType = "agent_strategy_declaration"
	REMOTE_PLUGIN_EVENT_TYPE_END                        RemotePluginEventType = "end"
)

type RemotePluginAssetChunk struct {
	Filename string `json:"filename" validate:"required"`
	Data     string `json:"data" validate:"required"`
	End      bool   `json:"end"` // if true, it's the last chunk of the file
}

type RemotePluginHandshake struct {
	Key string `json:"key" validate:"required"`
}

type RemotePluginPayload struct {
	Type RemotePluginEventType `json:"type" validate:"required"`
	Data json.RawMessage       `json:"data" validate:"required"`
}
