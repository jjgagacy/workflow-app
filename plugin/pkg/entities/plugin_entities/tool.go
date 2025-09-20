package plugin_entities

import (
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type ToolIdentity struct {
	Author string     `json:"author" validate:"required"`
	Name   string     `json:"name" validate:"required"`
	Label  I18nObject `json:"label" validate:"required"`
}

var toolIdentityNameRe = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)

func isToolIdentityName(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return toolIdentityNameRe.MatchString(value)
}

type ToolParameterType string

const (
	TOOL_PARAMETER_TYPE_STRING         ToolParameterType = PARAMETER_TYPE_STRING
	TOOL_PARAMETER_TYPE_NUMBER         ToolParameterType = PARAMETER_TYPE_NUMBER
	TOOL_PARAMETER_TYPE_BOOLEAN        ToolParameterType = PARAMETER_TYPE_BOOLEAN
	TOOL_PARAMETER_TYPE_SELECT         ToolParameterType = PARAMETER_TYPE_SELECT
	TOOL_PARAMETER_TYPE_SECRET_INPUT   ToolParameterType = PARAMETER_TYPE_SECRET_INPUT
	TOOL_PARAMETER_TYPE_FILE           ToolParameterType = PARAMETER_TYPE_FILE
	TOOL_PARAMETER_TYPE_FILES          ToolParameterType = PARAMETER_TYPE_FILES
	TOOL_PARAMETER_TYPE_APP_SELECTOR   ToolParameterType = PARAMETER_TYPE_APP_SELECTOR
	TOOL_PARAMETER_TYPE_MODEL_SELECTOR ToolParameterType = PARAMETER_TYPE_MODEL_SELECTOR
	TOOL_PARAMETER_TYPE_ANY            ToolParameterType = PARAMETER_TYPE_ANY
	TOOL_PARAMETER_TYPE_DYNAMIC_SELECT ToolParameterType = PARAMETER_TYPE_DYNAMIC_SELECT
	TOOL_PARAMETER_TYPE_ARRAY          ToolParameterType = PARAMETER_TYPE_ARRAY
	TOOL_PARAMETER_TYPE_OBJECT         ToolParameterType = PARAMETER_TYPE_OBJECT
)

var validToolParameterTypes = map[ToolParameterType]bool{
	TOOL_PARAMETER_TYPE_STRING:         true,
	TOOL_PARAMETER_TYPE_NUMBER:         true,
	TOOL_PARAMETER_TYPE_BOOLEAN:        true,
	TOOL_PARAMETER_TYPE_SELECT:         true,
	TOOL_PARAMETER_TYPE_SECRET_INPUT:   true,
	TOOL_PARAMETER_TYPE_FILE:           true,
	TOOL_PARAMETER_TYPE_FILES:          true,
	TOOL_PARAMETER_TYPE_APP_SELECTOR:   true,
	TOOL_PARAMETER_TYPE_MODEL_SELECTOR: true,
	TOOL_PARAMETER_TYPE_ANY:            true,
	TOOL_PARAMETER_TYPE_DYNAMIC_SELECT: true,
	TOOL_PARAMETER_TYPE_ARRAY:          true,
	TOOL_PARAMETER_TYPE_OBJECT:         true,
}

func isToolParameterType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validToolParameterTypes[ToolParameterType(value)]
}

type ToolParameterForm string

const (
	TOOL_PARAMETER_FROM_SCHEMA ToolParameterForm = "schema"
	TOOL_PARAMETER_FROM_FORM   ToolParameterForm = "form"
	TOOL_PARAMETER_FROM_LLM    ToolParameterForm = "llm"
)

var validToolParameterFroms = map[ToolParameterForm]bool{
	TOOL_PARAMETER_FROM_SCHEMA: true,
	TOOL_PARAMETER_FROM_FORM:   true,
	TOOL_PARAMETER_FROM_LLM:    true,
}

func isToolParameterForm(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validToolParameterFroms[ToolParameterForm(value)]
}

type ToolProviderIdentity struct {
	Author      string                       `json:"author" validate:"required"`
	Name        string                       `json:"name" validate:"required,tool_provider_identity_name"`
	Description I18nObject                   `json:"description"`
	Icon        string                       `json:"icon" validate:"required"`
	IconDark    string                       `json:"icon_dark" validate:"omitempty"`
	Label       I18nObject                   `json:"label" validate:"required"`
	Tags        []manifest_entites.PluginTag `json:"tags" validate:"omitempty,dive,plugin_tag"`
}

var toolProviderIdentityNameRe = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)

func isToolProviderIdentityName(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return toolProviderIdentityNameRe.MatchString(value)
}

type ParameterAutoGenerateType string

const (
	PARAMETER_AUTO_GENERATE_TYPE_PROMPT_INSTRUCTION ParameterAutoGenerateType = "prompt_instruction"
)

var validParameterAutoGenerateTypes = map[ParameterAutoGenerateType]bool{
	PARAMETER_AUTO_GENERATE_TYPE_PROMPT_INSTRUCTION: true,
}

func isParameterAutoGenerateType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validParameterAutoGenerateTypes[ParameterAutoGenerateType(value)]
}

type ParameterAutoGenerate struct {
	Type ParameterAutoGenerateType `json:"type" validate:"required,parameter_auto_generate_type"`
}

type ParameterTemplate struct {
	Enabled bool `json:"enabled"`
}

type ToolParameter struct {
	Name           string                 `json:"name" validate:"required,gt=0,lt=1024"`
	Label          I18nObject             `json:"label" validate:"required"`
	Description    I18nObject             `json:"description" validate:"required"`
	Type           ToolParameterType      `json:"type" validate:"required,tool_parameter_type"`
	Scope          *string                `json:"scope,omitempty" validate:"omitempty,max=1024,is_scope"`
	Form           ToolParameterForm      `json:"form" validate:"required,tool_parameter_form"`
	LLMDescription string                 `json:"llm_description,omitempty" validate:"omitempty"`
	Required       bool                   `json:"required"`
	AutoGenerate   *ParameterAutoGenerate `json:"auto_generate,omitempty" validate:"omitempty"`
	Template       *ParameterTemplate     `json:"template,omitempty" validate:"omitempty"`
	Default        any                    `json:"default,omitempty" validate:"omitempty,is_basic_type"`
	Min            *float64               `json:"min,omitempty" validate:"omitempty"`
	Max            *float64               `json:"max,omitempty" validate:"omitempty"`
	Precision      *int                   `json:"precision,omitempty" validate:"omitempty"`
	Options        []ParameterOption      `json:"options,omitempty" validate:"omitempty,dive"`
}

type ToolOutputSchema map[string]any

type ToolDescription struct {
	Description I18nObject `json:"description" validate:"required"`
	LLM         string     `json:"llm" validate:"required"`
}

type ToolDeclaration struct {
	Identity             ToolIdentity     `json:"identity" validate:"required"`
	Description          ToolDescription  `json:"description" validate:"required"`
	Parameters           []ToolParameter  `json:"parameters" validate:"omitempty,dive"`
	OutputSchema         ToolOutputSchema `json:"ouput_schema" validate:"omitempty,json_schema"`
	HasRuntimeParameters bool             `json:"has_runtime_parameters"`
}

type ToolProviderDeclaration struct {
	Identity          ToolProviderIdentity `json:"identity" validate:"required"`
	CredentialsSchema []ProviderConfig     `json:"credentials_schema,omitempty" validate:"omitempty,dive"`
	OauthSchema       *OAuthSchema         `json:"oauth_schema,omitempty"`
	Tools             []ToolDeclaration    `json:"tools" validate:"required,dive"`
	ToolFiles         []string             `json:"-"`
}

func isJsonSchema(fl validator.FieldLevel) bool {
	// todo
	return true
}

func init() {
	validators.EntitiesValidator.RegisterValidation("tool_identity_name", isToolIdentityName)
	validators.EntitiesValidator.RegisterValidation("is_basic_type", isBasicType)
	validators.EntitiesValidator.RegisterValidation("tool_provider_identity_name", isToolProviderIdentityName)
	validators.EntitiesValidator.RegisterValidation("parameter_auto_generate_type", isParameterAutoGenerateType)
	validators.EntitiesValidator.RegisterValidation("json_schemaa", isJsonSchema)
}
