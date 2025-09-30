package model_entities

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/shopspring/decimal"
)

type ModelType string

const (
	MODEL_TYPE_LLM            ModelType = "llm"
	MODEL_TYPE_TEXT_EMBEDDING ModelType = "text_embedding"
	MODEL_TYPE_RERANK         ModelType = "rerank"
	MODEL_TYPE_TTS            ModelType = "tts"
	MODEL_TYPE_SPEECH2TEXT    ModelType = "speech2text"
	MODEL_TYPE_MODERATION     ModelType = "moderation"
)

type LLMModel string

const (
	LLM_MODEL_CHAT       LLMModel = "chat"
	LLM_MODEL_COMPLETION LLMModel = "completion"
)

type PromptMessageRole string

const (
	PROMPT_MESSAGE_ROLE_SYSTEM    PromptMessageRole = "system"
	PROMPT_MESSAGE_ROLE_USER      PromptMessageRole = "user"
	PROMPT_MESSAGE_ROLE_ASSISTANT PromptMessageRole = "assistant"
	PROMPT_MESSAGE_ROLE_TOOL      PromptMessageRole = "tool"
)

type PromptMessageContentType string

const (
	PROMPT_MESSAGE_CONTENT_TYPE_TEXT     PromptMessageContentType = "text"
	PROMPT_MESSAGE_CONTENT_TYPE_IMAGE    PromptMessageContentType = "image"
	PROMPT_MESSAGE_CONTENT_TYPE_AUDIO    PromptMessageContentType = "audio"
	PROMPT_MESSAGE_CONTENT_TYPE_VIDEO    PromptMessageContentType = "video"
	PROMPT_MESSAGE_CONTENT_TYPE_DOCUMENT PromptMessageContentType = "document"
)

var validPromptMessageRoles = map[PromptMessageRole]bool{
	PROMPT_MESSAGE_ROLE_SYSTEM:    true,
	PROMPT_MESSAGE_ROLE_USER:      true,
	PROMPT_MESSAGE_ROLE_ASSISTANT: true,
	PROMPT_MESSAGE_ROLE_TOOL:      true,
}

var validPromptMessageContentTypes = map[PromptMessageContentType]bool{
	PROMPT_MESSAGE_CONTENT_TYPE_TEXT:     true,
	PROMPT_MESSAGE_CONTENT_TYPE_IMAGE:    true,
	PROMPT_MESSAGE_CONTENT_TYPE_AUDIO:    true,
	PROMPT_MESSAGE_CONTENT_TYPE_VIDEO:    true,
	PROMPT_MESSAGE_CONTENT_TYPE_DOCUMENT: true,
}

type PromptMessageContent struct {
	Type         PromptMessageContentType `json:"type" validate:"required,prompt_message_content_type"`
	Base64Data   string                   `json:"base64_data"`
	URL          string                   `json:"url"`
	Data         string                   `json:"data"`
	EncodeFormat string                   `json:"encode_format"`
	Format       string                   `json:"format"`
	MimeType     string                   `json:"mime_type"`
	Detail       string                   `json:"detail"`
}

type PromptMessageToolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

func isPromptMessageRole(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validPromptMessageRoles[PromptMessageRole(value)]
}

func isPromptMessageContentType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validPromptMessageContentTypes[PromptMessageContentType(value)]
}

func isPromptMessageContent(fl validator.FieldLevel) bool {
	content := fl.Field().Interface()
	switch v := content.(type) {
	case string:
		return true
	case []PromptMessageContent:
		// validate each content
		for _, c := range v {
			if err := validators.EntitiesValidator.Struct(c); err != nil {
				return false
			}
		}
		return true
	default:
		return false
	}
}

func init() {
	validators.EntitiesValidator.RegisterValidation("prompt_message_role", isPromptMessageRole)
	validators.EntitiesValidator.RegisterValidation("prompt_message_content_type", isPromptMessageContentType)
	validators.EntitiesValidator.RegisterValidation("prompt_message_content", isPromptMessageContent)
}

type PromptMessage struct {
	Role       PromptMessageRole       `json:"role" validate:"required,prompt_message_role"`
	Content    any                     `json:"content" validate:"required,prompt_message_content"`
	Name       string                  `json:"name"`
	ToolCalls  []PromptMessageToolCall `json:"tool_calls"`
	ToolCallId string                  `json:"tool_call_id"`
}

type PromptMessageTool struct {
	Name        string         `json:"name" validate:"required"`
	Description string         `json:"description"`
	Parameters  map[string]any `json:"parameters"`
}

type LLMResultChunk struct {
	Model             LLMModel            `json:"model" validate:"required"`
	SystemFingerprint string              `json:"system_fingerprint" validate:"omitempty"`
	Delta             LLMResultChunkDelta `json:"delta" validate:"omitempty"`
}

type LLMResultChunkDelta struct {
	Index        *int          `json:"index" validate:"required"`
	Message      PromptMessage `json:"message" validate:"required"`
	Usage        *LLMUsage     `json:"usage" validate:"omitempty"`
	FinishReason *string       `json:"finish_reason" validate:"omitempty"`
}

type LLMStructuredOutput struct {
	StructuredOutput map[string]any `json:"structured_output" validate:"omitempty"`
}

type LLMResultChunkWithStructuredOutput struct {
	Model             LLMModel            `json:"model" validate:"required"`
	SystemFingerprint string              `json:"system_fingerprint" validate:"omitempty"`
	Delta             LLMResultChunkDelta `json:"delta" validate:"omitempty"`

	LLMStructuredOutput
}

type LLMUsage struct {
	PromptTokens        int             `json:"prompt_tokens" validate:"required"`
	PromptUnitPrice     decimal.Decimal `json:"prompt_unit_price" validate:"required"`
	PromptPricePerUnit  decimal.Decimal `json:"prompt_price_per_unit" validate:"required"`
	PromptPrice         decimal.Decimal `json:"prompt_price" validate:"required"`
	CompletionTokens    *int            `json:"completion_tokens" validate:"required"`
	CompletionUnitPrice decimal.Decimal `json:"completion_unit_price" validate:"required"`
	CompletionPriceUnit decimal.Decimal `json:"completion_price_unit" validate:"required"`
	CompletionPrice     decimal.Decimal `json:"completion_price" validate:"required"`
	TotalTokens         *int            `json:"total_tokens" validate:"required"`
	TotalPrice          decimal.Decimal `json:"total_price" validate:"required"`
	Currency            *string         `json:"currency" validate:"required"`
	Latency             *float64        `json:"latency" validate:"required"`
}

type LLMNumTokensResponse struct {
	NumTokens int `json:"num_tokens"`
}
