package plugin_entities

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type AgentStrategyProviderIdentity struct {
	ToolProviderIdentity `json:",inline" yaml:"tool_provider_identity"`
}

type AgentStrategyIdentity struct {
	ToolIdentity `json:",inline"`
}

type AgentStrategyOutputSchema map[string]any

type AgentStrategyParameterType string

type ParameterOption struct {
	Value string     `json:"value"`
	Label I18nObject `json:"label"`
	Icon  string     `json:"icon"`
}

const (
	AGENT_STRATEGY_PARAMETER_TYPE_STRING         AgentStrategyParameterType = PARAMETER_TYPE_STRING
	AGENT_STRATEGY_PARAMETER_TYPE_NUMBER         AgentStrategyParameterType = PARAMETER_TYPE_NUMBER
	AGENT_STRATEGY_PARAMETER_TYPE_BOOLEAN        AgentStrategyParameterType = PARAMETER_TYPE_BOOLEAN
	AGENT_STRATEGY_PARAMETER_TYPE_SELECT         AgentStrategyParameterType = PARAMETER_TYPE_SELECT
	AGENT_STRATEGY_PARAMETER_TYPE_SECRET_INPUT   AgentStrategyParameterType = PARAMETER_TYPE_SECRET_INPUT
	AGENT_STRATEGY_PARAMETER_TYPE_FILE           AgentStrategyParameterType = PARAMETER_TYPE_FILE
	AGENT_STRATEGY_PARAMETER_TYPE_FILES          AgentStrategyParameterType = PARAMETER_TYPE_FILES
	AGENT_STRATEGY_PARAMETER_TYPE_APP_SELECTOR   AgentStrategyParameterType = PARAMETER_TYPE_APP_SELECTOR
	AGENT_STRATEGY_PARAMETER_TYPE_MODEL_SELECTOR AgentStrategyParameterType = PARAMETER_TYPE_MODEL_SELECTOR
	AGENT_STRATEGY_PARAMETER_TYPE_TOOLS_SELECTOR AgentStrategyParameterType = PARAMETER_TYPE_TOOLS_SELECTOR
	AGENT_STRATEGY_PARAMETER_TYPE_ANY            AgentStrategyParameterType = PARAMETER_TYPE_ANY
)

var validAgentStrategyParameterTypes = map[AgentStrategyParameterType]bool{
	AGENT_STRATEGY_PARAMETER_TYPE_STRING:         true,
	AGENT_STRATEGY_PARAMETER_TYPE_NUMBER:         true,
	AGENT_STRATEGY_PARAMETER_TYPE_BOOLEAN:        true,
	AGENT_STRATEGY_PARAMETER_TYPE_SELECT:         true,
	AGENT_STRATEGY_PARAMETER_TYPE_SECRET_INPUT:   true,
	AGENT_STRATEGY_PARAMETER_TYPE_FILE:           true,
	AGENT_STRATEGY_PARAMETER_TYPE_FILES:          true,
	AGENT_STRATEGY_PARAMETER_TYPE_APP_SELECTOR:   true,
	AGENT_STRATEGY_PARAMETER_TYPE_MODEL_SELECTOR: true,
	AGENT_STRATEGY_PARAMETER_TYPE_TOOLS_SELECTOR: true,
	AGENT_STRATEGY_PARAMETER_TYPE_ANY:            true,
}

func isAgentStrategyParameterType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validAgentStrategyParameterTypes[AgentStrategyParameterType(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("agent_strategy_parameter_type", isAgentStrategyParameterType)
}

type AgentStrategyParameter struct {
	Name      string                     `json:"name" validate:"required,gt=0,lt=1024" yaml:"name"`
	Label     I18nObject                 `json:"label" validate:"required" yaml:"label"`
	Help      I18nObject                 `json:"help" validate:"omitempty" yaml:"help,omitempty"`
	Type      AgentStrategyParameterType `json:"type" validate:"required,agent_strategy_parameter_type" yaml:"type"`
	Scope     *string                    `json:"scope,omitempty" validate:"omitempty,is_scope,max=1024" yaml:"scope,omitempty"`
	Required  *string                    `json:"required,omitempty" yaml:"required,omitempty"`
	Default   any                        `json:"default,omitempty" validate:"omitempty,is_basic_type" yaml:"default,omitempty"`
	Min       *float64                   `json:"min,omitempty" validate:"omitempty,number" yaml:"min,omitempty"`
	Max       *float64                   `json:"max,omitempty" validate:"omitempty,number,gtfield=Min" yaml:"max,omitempty"`
	Precision *int                       `json:"precision,omitempty" validate:"omitempty,number,min=0,max=10" yaml:"precision,omitempty"`
	Options   []ParameterOption          `json:"options,omitempty" validate:"omitempty,dive,required" yaml:"options,omitempty"`
}

type AgentStrategyDeclaration struct {
	Identity     AgentStrategyIdentity     `json:"identity" validate:"required" yaml:"identity"`
	Description  I18nObject                `json:"description" yaml:"description"`
	Parameters   []AgentStrategyParameter  `json:"parameters" yaml:"parameters,omitempty"`
	OutputSchema AgentStrategyOutputSchema `json:"output_schema" yaml:"output_schema"`
	Features     []string                  `json:"features" yaml:"features,omitempty"`
}

type AgentStrategyProviderDeclaration struct {
	Identity      AgentStrategyProviderIdentity `json:"identity" validate:"required" yaml:"identity"`
	Strategies    []AgentStrategyDeclaration    `json:"strategies" yaml:"strategies,omitempty"`
	StrategyFiles []string                      `json:"-" yaml:"strategy_files,omitempty"`
}
