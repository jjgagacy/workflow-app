package invocation

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
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
	InvokeLLMSchema

	requests.BaseRequestInvokeModel
}

type InvokeLLMWithStructuredOutputRequest struct {
	BaseInvokeRequest
	InvokeLLMSchema
	requests.BaseRequestInvokeModel
	StructuredOutputSchema map[string]any `json:"structured_output_schema" validate:"required"`
}

type InvokeTextEmbeddingRequest struct {
	BaseInvokeRequest
	requests.BaseRequestInvokeModel
	requests.InvokeTextEmbeddingSchema
}

type InvokeRerankRequest struct {
	BaseInvokeRequest
	requests.BaseRequestInvokeModel
	requests.InvokeRerankSchema
}

type InvokeTTSRequest struct {
	UserID string     `json:"user_id"`
	Type   InvokeType `json:"type"`
	requests.BaseRequestInvokeModel
	requests.InvokeTTSSchema
}

type InvokeSpeech2TextRequest struct {
	BaseInvokeRequest
	requests.BaseRequestInvokeModel
	requests.InvokeSpeech2TextSchema
}

type InvokeModerationRequest struct {
	BaseInvokeRequest
	requests.BaseRequestInvokeModel
	requests.InvokeModerationSchema
}

type InvokeAppSchema struct {
	AppID          string         `json:"app_id" validate:"required"`
	Inputs         map[string]any `json:"inputs" validate:"omitempty"`
	Query          string         `json:"query" validate:"omitempty"`
	ResponseMode   string         `json:"resonse_mode"`
	ConversationID string         `json:"conversation_id" validate:"omitempty"`
	User           string         `json:"user" validate:"omitempty"`
}

type StorageOption string

const (
	STORAGE_OPTION_GET   StorageOption = "get"
	STORAGE_OPTION_SET   StorageOption = "set"
	STORAGE_OPTION_DEL   StorageOption = "del"
	STORAGE_OPTION_EXIST StorageOption = "exist"
)

var validStorageOptions = map[StorageOption]bool{
	STORAGE_OPTION_GET:   true,
	STORAGE_OPTION_SET:   true,
	STORAGE_OPTION_DEL:   true,
	STORAGE_OPTION_EXIST: true,
}

func isStorageOption(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validStorageOptions[StorageOption(value)]
}

type InvokeStorageRequest struct {
	Opt   StorageOption `json:"opt" validate:"required,storage_option"`
	Key   string        `json:"key" validate:"required"`
	Value string        `json:"value"`
}

type InvokeAppRequest struct {
	BaseInvokeRequest

	InvokeAppSchema
}

type ModelConfig struct {
	Provider         string         `json:"provider" validate:"required"`
	Name             string         `json:"name" validate:"required"`
	Mode             string         `json:"mod" validate:"required"`
	CompletionParams map[string]any `json:"completion_params" validate:"omitempty"`
}

type InvokeParameterExtractorRequest struct {
	BaseInvokeRequest

	Parameters []struct {
		Name        string   `json:"name" validate:"required"`
		Type        string   `json:"type" validate:"required,oneof=string number bool select array[string] array[number] array[object]"`
		Option      []string `json:"options" validate:"omitempty"`
		Description string   `json:"description" validate:"omitempty"`
		Required    bool     `json:"required" validate:"omitempty"`
	} `json:"parameters" validate:"required,dive"`

	Model       ModelConfig `json:"model" validate:"required"`
	Instruction string      `json:"instruction" validate:"omitempty"`
	Query       string      `json:"query" validate:"required"`
}

type InvokeQuestionClassifierRequest struct {
	BaseInvokeRequest

	Classes []struct {
		ID   string `json:"id" validate:"required"`
		Name string `json:"name" validate:"required"`
	} `json:"classes" validate:"required,dive"`

	Model       ModelConfig `json:"model" validate:"required"`
	Instruction string      `json:"instruction" validate:"omitempty"`
	Query       string      `json:"query" validate:"required"`
}

type EncryptOpt string

const (
	ENCRYPT_OPT_ENCRYPT EncryptOpt = "encrypt"
	ENCRYPT_OPT_DECRYPT EncryptOpt = "descript"
	ENCRYPT_OPT_CLEAR   EncryptOpt = "clear"
)

var validEncryptTypes = map[EncryptOpt]bool{
	ENCRYPT_OPT_ENCRYPT: true,
	ENCRYPT_OPT_DECRYPT: true,
	ENCRYPT_OPT_CLEAR:   true,
}

func isEncryptOpt(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validEncryptTypes[EncryptOpt(value)]
}

type EncryptNamespace string

const (
	ENCRYPT_NAMESPACE_ENDPOINT EncryptNamespace = "endpoint"
)

var validEncryptNamespaces = map[EncryptNamespace]bool{
	ENCRYPT_NAMESPACE_ENDPOINT: true,
}

func isEncryptNamespace(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validEncryptNamespaces[EncryptNamespace(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("storage_option", isStorageOption)
	validators.EntitiesValidator.RegisterValidation("encrypt_opt", isEncryptOpt)
	validators.EntitiesValidator.RegisterValidation("encrypt_namespace", isEncryptNamespace)
}

type InvokeEncryptSchema struct {
	Opt       EncryptOpt                       `json:"opt" validate:"required,encrypt_opt"`
	Namespace EncryptNamespace                 `json:"namespace" validate:"required,encrypt_namespace"`
	Identity  string                           `json:"identity" validate:"required"`
	Data      map[string]any                   `json:"data" validate:"omitempty"`
	Config    []plugin_entities.ProviderConfig `json:"config" validate:"omitempty,dive"`
}

type InvokeEncryptRequest struct {
	BaseInvokeRequest

	InvokeEncryptSchema
}

func (r *InvokeEncryptRequest) EncryptRequired() bool {
	if r.Config == nil {
		return false
	}

	for _, config := range r.Config {
		if config.Type == "secret-input" {
			return true
		}
	}

	return false
}

type InvokeToolRequest struct {
	BaseInvokeRequest

	ToolType       requests.ToolType `json:"tool_type" validate:"required,tool_type"`
	CredentialId   string            `json:"credential_id" validate:"omitempty"`
	CredentialType string            `json:"credential_type,omitempty" validate:"omitempty"`
	requests.InvokeToolSchema
}

type InvokeNodeResponse struct {
	ProcessData map[string]any `json:"process_data" validate:"required"`
	Outputs     map[string]any `json:"outputs" validate:"required"`
	Inputs      map[string]any `json:"inputs" validate:"required"`
}

type InvokeEncryptionResponse struct {
	Error string         `json:"error"`
	Data  map[string]any `json:"data"`
}

type InvokeSummarySchema struct {
	Text        string `json:"text" validate:"required"`
	Instruction string `json:"instruction" validate:"omitempty"`
}

type InvokeSummaryRequest struct {
	BaseInvokeRequest
	InvokeSummarySchema
}

type InvokeSummaryResponse struct {
	Summary string `json:"summary"`
}

type UploadFileRequest struct {
	BaseInvokeRequest
	Filename string `json:"filename" validate:"required"`
	MimeType string `json:"mimetype" validate:"required"`
}

type UploadFileResponse struct {
	URL string `json:"url"`
}

type FetchAppRequest struct {
	BaseInvokeRequest

	AppID string `json:"app_id" validate:"required"`
}
