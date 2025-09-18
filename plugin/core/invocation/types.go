package invocation

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
)

type InvokeType string

type BaseInvokeRequest struct {
	TenantID string     `json:"tenant_id"`
	UserID   string     `json:"user_id"`
	Type     InvokeType `json:"type"`
}

const (
	INVOKE_TYPE_LLM                   InvokeType = "llm"
	INVOKE_TYPE_LLM_STRUCTURED_OUTPUT InvokeType = "llm_structored_output"
	INVOKE_TYPE_TEXT_EMBEDDING        InvokeType = "text_embedding"
	INVOKE_TYPE_RERANK                InvokeType = "rerank"
	INVOKE_TYPE_TTS                   InvokeType = "tts"
	INVOKE_TYPE_SPEECH2TEXT           InvokeType = "speech2text"
	INVOKE_TYPE_MODERATION            InvokeType = "moderation"
	INVOKE_TYPE_TOOL                  InvokeType = "tool"
	INVOKE_TYPE_APP                   InvokeType = "app"
	INVOKE_TYPE_STORAGE               InvokeType = "storage"
	INVOKE_TYPE_ENCRYPT               InvokeType = "encrypt"
	INVOKE_TYPE_UPLOAD_FILE           InvokeType = "upload_file"
	INVOKE_TYPE_FETCH_APP             InvokeType = "fetch_app"
)

type InvokeLLMSchema struct {
	Mode             string                                 `json:"mode" validate:"required"` // chat or completion
	CompletionParams map[string]any                         `json:"completion_params" validate:"omitempty"`
	PromptMessages   []model_entities.PromptMessage         `json:"prompt_messages" validate:"omitempty"`
	Tools            []model_entities.PromptMessageToolCall `json:"tools" validate:"omitempty,dive"`
	Stop             []string                               `json:"stop" validate:"omitempty"`
	Stream           bool                                   `json:"stream"`
}

type InvokeLLMRequest struct {
	BaseInvokeRequest
	requests.BaseRequestInvokeModel
	InvokeLLMSchema
}
