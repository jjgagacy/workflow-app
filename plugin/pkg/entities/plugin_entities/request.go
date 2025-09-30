package plugin_entities

type InvokePluginUserIdentity struct {
	TenantID string `json:"tenant_id" validate:"required" uri:"tenant_id"`
	UserID   string `json:"user_id"`
}

type BasePluginIdentifier struct {
	PluginID string `json:"plugin_id"`
}

type InvokePluginRequest[T any] struct {
	InvokePluginUserIdentity
	BasePluginIdentifier

	UniqueIdentifier PluginUniqueIdentifier `json:"unique_identifier"`
	ConversationID   *string                `json:"conversation_id"`
	MessageID        *string                `json:"message_id"`
	AppID            *string                `json:"app_id"`
	EndPointID       *string                `json:"endpoint_id"`
	Context          map[string]any         `json:"context"`

	Data T `json:"data" validate:"required"`
}
