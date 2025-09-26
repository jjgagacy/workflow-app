package plugin_entities

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/shopspring/decimal"
)

type ModelType string

const (
	MODEL_TYPE_LLM            ModelType = "llm"
	MODEL_TYPE_TEXT_EMBEDDING ModelType = "text-embedding"
	MODEL_TYPE_RERANK         ModelType = "rerank"
	MODEL_TYPE_SPEECH2TEXT    ModelType = "speech2text"
	MODEL_TYPE_MODERATION     ModelType = "moderation"
	MODEL_TYPE_TTS            ModelType = "tts"
	MODEL_TYPE_TEXT2IMG       ModelType = "text2img"
)

var validModelTypes = map[ModelType]bool{
	MODEL_TYPE_LLM:            true,
	MODEL_TYPE_TEXT_EMBEDDING: true,
	MODEL_TYPE_RERANK:         true,
	MODEL_TYPE_SPEECH2TEXT:    true,
	MODEL_TYPE_MODERATION:     true,
	MODEL_TYPE_TTS:            true,
	MODEL_TYPE_TEXT2IMG:       true,
}

func isModelType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validModelTypes[ModelType(value)]
}

type ModelProviderConfigMethod string

const (
	PREDEFINED_MODEL   ModelProviderConfigMethod = "predefined-model"
	CUSTOMIZABLE_MODEL ModelProviderConfigMethod = "customizable-model"
)

var validModelProviderConfigMethods = map[ModelProviderConfigMethod]bool{
	PREDEFINED_MODEL:   true,
	CUSTOMIZABLE_MODEL: true,
}

func isModelProviderConfigMethod(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validModelProviderConfigMethods[ModelProviderConfigMethod(value)]
}

type ModelParameterType string

const (
	MODEL_PARAMETER_TYPE_FLOAT   ModelParameterType = "float"
	MODEL_PARAMETER_TYPE_INT     ModelParameterType = "int"
	MODEL_PARAMETER_TYPE_STRING  ModelParameterType = "string"
	MODEL_PARAMETER_TYPE_BOOLEAN ModelParameterType = "boolean"
	MODEL_PARAMETER_TYPE_TEXT    ModelParameterType = "text"
)

var validModelParameterTypes = map[ModelParameterType]bool{
	MODEL_PARAMETER_TYPE_FLOAT:   true,
	MODEL_PARAMETER_TYPE_INT:     true,
	MODEL_PARAMETER_TYPE_STRING:  true,
	MODEL_PARAMETER_TYPE_BOOLEAN: true,
	MODEL_PARAMETER_TYPE_TEXT:    true,
}

func isModelParameterType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validModelParameterTypes[ModelParameterType(value)]
}

type DefaultModelParameterName string

const (
	MODEL_PARAMETER_NAME_TEMPERATURE       DefaultModelParameterName = "temperature"
	MODEL_PARAMETER_NAME_TOP_P             DefaultModelParameterName = "top_p"
	MODEL_PARAMETER_NAME_TOP_K             DefaultModelParameterName = "top_k"
	MODEL_PARAMETER_NAME_PRESENCE_PENALTY  DefaultModelParameterName = "presence_penalty"
	MODEL_PARAMETER_NAME_FREQUENCY_PENALTY DefaultModelParameterName = "frequency_penalty"
	MODEL_PARAMETER_NAME_MAX_TOKENS        DefaultModelParameterName = "max_tokens"
	MODEL_PARAMETER_NAME_RESPONSE_FORMAT   DefaultModelParameterName = "response_format"
	MODEL_PARAMETER_NAME_JSON_SCHEMA       DefaultModelParameterName = "json_schema"
)

var validDefaultModelParameterNames = map[DefaultModelParameterName]bool{
	MODEL_PARAMETER_NAME_TEMPERATURE:       true,
	MODEL_PARAMETER_NAME_TOP_P:             true,
	MODEL_PARAMETER_NAME_TOP_K:             true,
	MODEL_PARAMETER_NAME_PRESENCE_PENALTY:  true,
	MODEL_PARAMETER_NAME_FREQUENCY_PENALTY: true,
	MODEL_PARAMETER_NAME_MAX_TOKENS:        true,
	MODEL_PARAMETER_NAME_RESPONSE_FORMAT:   true,
	MODEL_PARAMETER_NAME_JSON_SCHEMA:       true,
}

func isDefaultModelParameterName(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validDefaultModelParameterNames[DefaultModelParameterName(value)]
}

type ModelParameterRule struct {
	Name        string              `json:"name"`
	UseTemplate *string             `json:"use_template,omitempty"`
	Label       *I18nObject         `json:"label,omitempty"`
	Type        *ModelParameterType `json:"type,omitempty"`
	Help        *I18nObject         `json:"help,omitempty"`
	Required    bool                `json:"required"`
	Default     *any                `json:"default,omitempty"`
	Min         *float64            `json:"min,omitempty"`
	Max         *float64            `json:"max,omitempty"`
	Precision   *int                `json:"precision,omitempty"`
	Options     []string            `json:"options,omitempty"`
}

func isParameterRule(fl validator.FieldLevel) bool {
	useTemplate := fl.Field().FieldByName("UseTemplate")
	if useTemplate.IsNil() {
		if fl.Field().FieldByName("Label").IsNil() {
			return false
		}

		if fl.Field().FieldByName("Type").IsNil() {
			return false
		}
	}
	return true
}

type ModelPriceConfig struct {
	Input    decimal.Decimal  `json:"input"`
	Output   *decimal.Decimal `json:"output"`
	Unit     decimal.Decimal  `json:"unit"`
	Currency string           `json:"currency"`
}

type ModelDeclaration struct {
	Model           string                    `json:"model" validate:"required,lt=256"`
	Label           I18nObject                `json:"label" validate:"required"`
	ModelType       ModelType                 `json:"model_type" validate:"required,model_type"`
	Features        []string                  `json:"features,omitempty" validate:"omitempty,dive,required,lt=256"`
	FetchFrom       ModelProviderConfigMethod `json:"fetch_from" validate:"required,model_provider_configuration_method"`
	ModelProperties map[string]any            `json:"model_properties,omitempty" validate:"omitempty"`
	Deprecated      bool                      `json:"deprecated,omitempty"`
	ParameterRules  []ModelParameterRule      `json:"parameter_rules,omitempty" validate:"omitempty,dive,parameter_rule"`
	PriceConfig     *ModelPriceConfig         `json:"price_config,omitempty" validate:"omitempty"`
}

type ModelProviderFormType string

const (
	MODEL_PROVIDER_FORM_TYPE_TEXT_INPUT   ModelProviderFormType = "text-input"
	MODEL_PROVIDER_FORM_TYPE_SECRET_INPUT ModelProviderFormType = "secret-input"
	MODEL_PROVIDER_FORM_TYPE_SELECT       ModelProviderFormType = "select"
	MODEL_PROVIDER_FORM_TYPE_RADIO        ModelProviderFormType = "radio"
	MODEL_PROVIDER_FORM_TYPE_SWITCH       ModelProviderFormType = "switch"
)

type ModelProviderHelp struct {
	Title I18nObject `json:"title" validate:"required"`
	URL   I18nObject `json:"url" validate:"required"`
}

type FieldModelSchema struct {
	Label       I18nObject  `json:"label"`
	Placeholder *I18nObject `json:"placeholder"`
}

type ShowOnObject struct {
	Variable string `json:"variable"`
	Value    string `json:"value"`
}

type ModelProviderFormOption struct {
	Label  I18nObject     `json:"label"`
	Value  string         `json:"value"`
	ShowOn []ShowOnObject `json:"show_on"`
}

type ModelProviderCredentialFormSchema struct {
	Variable    string                    `json:"variable" validate:"required,lt=256"`
	Label       I18nObject                `json:"label" validate:"required"`
	Type        ModelProviderFormType     `json:"type" validate:"required,model_provider_form_type"`
	Required    bool                      `json:"required"`
	Default     *string                   `json:"default,omitempty" validate:"omitempty,lt=256"`
	Options     []ModelProviderFormOption `json:"options,omitempty" validate:"omitempty,dive,lte=128"`
	Placeholder *I18nObject               `json:"placeholder,omitempty"`
	MaxLength   int                       `json:"max_length,omitempty"`
	ShowOn      []ShowOnObject            `json:"show_on,omitempty" validate:"omitempty,dive,lte=16"`
}

type ModelCredentialSchema struct {
	Model                FieldModelSchema                    `json:"model"`
	CredentialFormSchema []ModelProviderCredentialFormSchema `json:"credential_form_schema"`
}

type ModelProviderCredentialSchema struct {
	CredentialFormSchemas []ModelProviderCredentialFormSchema `json:"credential_form_schema"`
}

// 模型能力
type ModelCapabilities struct {
	LLM           *[]string `json:"llm,omitempty"`
	TextEmbedding *[]string `json:"text_embedding,omitempty"`
	Rerank        *[]string `json:"rerank,omitempty"`
	TTS           *[]string `json:"tts,omitempty"`
	Speech2text   *[]string `json:"speech2text,omitempty"`
	Moderation    *[]string `json:"moderation,omitempty"`
}

type ModelProviderDeclaration struct {
	Provider                 string                         `json:"provider" validate:"required,lt=256"`
	Label                    I18nObject                     `json:"label" validate:"required"`
	Description              *I18nObject                    `json:"description,omitempty"`
	IconSamll                *I18nObject                    `json:"icon_small,omitempty"`
	IconLarge                *I18nObject                    `json:"icon_large,omitempty"`
	IconSmallDark            *I18nObject                    `json:"icon_small_dark,omitempty"`
	IconLargeDark            *I18nObject                    `json:"icon_large_dark,omitempty"`
	Background               *string                        `json:"background,omitempty"`
	Help                     *ModelProviderHelp             `json:"help,omitempty"`
	SupportedModelTypes      []ModelType                    `json:"supported_model_types" validate:"required,dive,model_type,lte=16"`
	ConfigMethods            *ModelProviderConfigMethod     `json:"config_methods,omitempty" validate:"required,lte=16,dive,model_provider_configuration_method"`
	ProviderCredentialSchema *ModelProviderCredentialSchema `json:"provider_credential_schema,omitempty"`
	ModelCredentialSchema    *ModelCredentialSchema         `json:"model_credential_schema,omitempty"`
	Capability               *ModelCapabilities             `json:"position,omitempty"`
	Models                   []ModelDeclaration             `json:"models" validate:"required,dive"`
	ModelFiles               []string                       `json:"-"`
	PositionFiles            map[string]string              `json:"-"`
}

func init() {
	validators.EntitiesValidator.RegisterValidation("model_type", isModelType)
	validators.EntitiesValidator.RegisterValidation("model_provider_configuration_method", isModelProviderConfigMethod)
	validators.EntitiesValidator.RegisterValidation("parameter_rule", isParameterRule)
}
