package plugin_entities

import (
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type ConfigType string

const (
	CONFIG_TYPE_SECRET_INPUT   ConfigType = PARAMETER_TYPE_SECRET_INPUT
	CONFIG_TYPE_TEXT_INPUT     ConfigType = PARAMETER_TYPE_TEXT_INPUT
	CONFIG_TYPE_SELECT         ConfigType = PARAMETER_TYPE_SELECT
	CONFIG_TYPE_BOOLEAN        ConfigType = PARAMETER_TYPE_BOOLEAN
	CONFIG_TYPE_MODEL_SELECTOR ConfigType = PARAMETER_TYPE_MODEL_SELECTOR
	CONFIG_TYPE_APP_SELECTOR   ConfigType = PARAMETER_TYPE_APP_SELECTOR
	CONFIG_TYPE_TOOLS_SELECTOR ConfigType = PARAMETER_TYPE_TOOLS_SELECTOR
	CONFIG_TYPE_ANY            ConfigType = PARAMETER_TYPE_ANY
)

type ModelConfigScope string

const (
	MODEL_CONFIG_SCOPE_ALL            ModelConfigScope = "all"
	MODEL_CONFIG_SCOPE_LLM            ModelConfigScope = "llm"
	MODEL_CONFIG_SCOPE_TEXT_EMBEDDING ModelConfigScope = "text-embedding"
	MODEL_CONFIG_SCOPE_RERANK         ModelConfigScope = "rerank"
	MODEL_CONFIG_SCOPE_TTS            ModelConfigScope = "tts"
	MODEL_CONFIG_SCOPE_SPEECH2TEXT    ModelConfigScope = "speech2text"
	MODEL_CONFIG_SCOPE_MODERATION     ModelConfigScope = "moderation"
	MODEL_CONFIG_SCOPE_VISION         ModelConfigScope = "vision"
	MODEL_CONFIG_SCOPE_DOCUMENT       ModelConfigScope = "document"
	MODEL_CONFIG_SCOPE_TOOL_CALL      ModelConfigScope = "tool-call"
)

type AppSelectorScope string

const (
	APP_SELECTOR_SCOPE_ALL        AppSelectorScope = "all"
	APP_SELECTOR_SCOPE_CHAT       AppSelectorScope = "chat"
	APP_SELECTOR_SCOPE_WORKFLOW   AppSelectorScope = "workflow"
	APP_SELECTOR_SCOPE_COMPLETION AppSelectorScope = "completion"
)

type ToolSelectorScope string

const (
	TOOL_SELECTOR_SCOPE_ALL      ToolSelectorScope = "all"
	TOOL_SELECTOR_SCOPE_PLUGIN   ToolSelectorScope = "plugin"
	TOOL_SELECTOR_SCOPE_API      ToolSelectorScope = "api"
	TOOL_SELECTOR_SCOPE_WORKFLOW ToolSelectorScope = "workflow"
)

type AnyScope string

const (
	ANY_SCOPE_STRING       AnyScope = "string"
	ANY_SCOPE_NUMBER       AnyScope = "number"
	ANY_SCOPE_OBJECT       AnyScope = "object"
	ANY_SCOPE_ARRAY_NUMBER AnyScope = "array[number]"
	ANY_SCOPE_ARRAY_STRING AnyScope = "array[string]"
	ANY_SCOPE_ARRAY_OBJECT AnyScope = "array[object]"
	ANY_SCOPE_ARRAY_FILES  AnyScope = "array[file]"
)

type ConfigOption struct {
	Label I18nObject `json:"label"`
	Value string     `json:"value"`
}

// ConfigType 验证
var validConfigTypes = map[ConfigType]bool{
	CONFIG_TYPE_SECRET_INPUT:   true,
	CONFIG_TYPE_TEXT_INPUT:     true,
	CONFIG_TYPE_SELECT:         true,
	CONFIG_TYPE_BOOLEAN:        true,
	CONFIG_TYPE_MODEL_SELECTOR: true,
	CONFIG_TYPE_APP_SELECTOR:   true,
	CONFIG_TYPE_TOOLS_SELECTOR: true,
	CONFIG_TYPE_ANY:            true,
}

func IsValidConfigType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validConfigTypes[ConfigType(value)]
}

// ModelConfigScope 验证
var validModelConfigScopes = map[ModelConfigScope]bool{
	MODEL_CONFIG_SCOPE_ALL:            true,
	MODEL_CONFIG_SCOPE_LLM:            true,
	MODEL_CONFIG_SCOPE_TEXT_EMBEDDING: true,
	MODEL_CONFIG_SCOPE_RERANK:         true,
	MODEL_CONFIG_SCOPE_TTS:            true,
	MODEL_CONFIG_SCOPE_SPEECH2TEXT:    true,
	MODEL_CONFIG_SCOPE_MODERATION:     true,
	MODEL_CONFIG_SCOPE_VISION:         true,
	MODEL_CONFIG_SCOPE_DOCUMENT:       true,
	MODEL_CONFIG_SCOPE_TOOL_CALL:      true,
}

var validCredentialTypes = map[ConfigType]bool{
	CONFIG_TYPE_SECRET_INPUT:   true,
	CONFIG_TYPE_TEXT_INPUT:     true,
	CONFIG_TYPE_SELECT:         true,
	CONFIG_TYPE_BOOLEAN:        true,
	CONFIG_TYPE_APP_SELECTOR:   true,
	CONFIG_TYPE_MODEL_SELECTOR: true,
	CONFIG_TYPE_TOOLS_SELECTOR: true,
}

func IsCredentialType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validCredentialTypes[ConfigType(value)]
}

func IsValidModelConfigScope(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validModelConfigScopes[ModelConfigScope(value)]
}

// AppSelectorScope 验证
var validAppSelectorScopes = map[AppSelectorScope]bool{
	APP_SELECTOR_SCOPE_ALL:        true,
	APP_SELECTOR_SCOPE_CHAT:       true,
	APP_SELECTOR_SCOPE_WORKFLOW:   true,
	APP_SELECTOR_SCOPE_COMPLETION: true,
}

func IsValidAppSelectorScope(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validAppSelectorScopes[AppSelectorScope(value)]
}

// ToolSelectorScope 验证
var validToolSelectorScopes = map[ToolSelectorScope]bool{
	TOOL_SELECTOR_SCOPE_ALL:      true,
	TOOL_SELECTOR_SCOPE_PLUGIN:   true,
	TOOL_SELECTOR_SCOPE_API:      true,
	TOOL_SELECTOR_SCOPE_WORKFLOW: true,
}

func IsValidToolSelectorScope(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validToolSelectorScopes[ToolSelectorScope(value)]
}

// AnyScope 验证
var validAnyScopes = map[AnyScope]bool{
	ANY_SCOPE_STRING:       true,
	ANY_SCOPE_NUMBER:       true,
	ANY_SCOPE_OBJECT:       true,
	ANY_SCOPE_ARRAY_NUMBER: true,
	ANY_SCOPE_ARRAY_STRING: true,
	ANY_SCOPE_ARRAY_OBJECT: true,
	ANY_SCOPE_ARRAY_FILES:  true,
}

func IsValidAnyScope(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validAnyScopes[AnyScope(value)]
}

type ProviderConfig struct {
	Name     string         `json:"name" yaml:"name"`
	Type     string         `json:"type" yaml:"type"`
	Scope    *string        `json:"scope" yaml:"scope,omitempty"`
	Required bool           `json:"required" yaml:"required"`
	Default  any            `json:"default" yaml:"default"`
	Options  []ConfigOption `json:"options" yaml:"options"`
	Label    *I18nObject    `json:"label" yaml:"label,omitempty"`
	Help     *I18nObject    `json:"help" yaml:"help,omitempty"`
	URL      *string        `json:"url" yaml:"url,omitempty"`
}

func isScope(fl validator.FieldLevel) bool {
	parent := fl.Parent().Interface()
	if providerConfig, ok := parent.(ProviderConfig); ok {
		switch providerConfig.Type {
		case string(CONFIG_TYPE_APP_SELECTOR):
			return IsValidAppSelectorScope(fl)
		case string(CONFIG_TYPE_MODEL_SELECTOR):
			return IsValidModelConfigScope(fl)
		case string(CONFIG_TYPE_ANY):
			return IsValidAnyScope(fl)
		default:
			return false
		}
	}
	if toolParameter, ok := parent.(ToolParameter); ok {
		switch toolParameter.Type {
		case TOOL_PARAMETER_TYPE_APP_SELECTOR:
			return IsValidAppSelectorScope(fl)
		case TOOL_PARAMETER_TYPE_MODEL_SELECTOR:
			return IsValidModelConfigScope(fl)
		case TOOL_PARAMETER_TYPE_ANY:
			return IsValidAnyScope(fl)
		default:
			return false
		}
	}
	if agentStrategyParameter, ok := parent.(AgentStrategyParameter); ok {
		switch agentStrategyParameter.Type {
		case AGENT_STRATEGY_PARAMETER_TYPE_APP_SELECTOR:
			return IsValidAppSelectorScope(fl)
		case AGENT_STRATEGY_PARAMETER_TYPE_MODEL_SELECTOR:
			return IsValidModelConfigScope(fl)
		case AGENT_STRATEGY_PARAMETER_TYPE_ANY:
			return IsValidAnyScope(fl)
		default:
			return false
		}
	}
	return true
}

func init() {
	validators.EntitiesValidator.RegisterValidation("is_scope", isScope)
	validators.EntitiesValidator.RegisterValidation("is_app_selector_scope", IsValidAppSelectorScope)
	validators.EntitiesValidator.RegisterValidation("is_model_config_scope", IsValidModelConfigScope)
	validators.EntitiesValidator.RegisterValidation("is_tool_selector_scope", IsValidToolSelectorScope)
	validators.EntitiesValidator.RegisterValidation("is_credential_type", IsCredentialType)
}

func ValidateProviderConfig(settings map[string]any, configs []ProviderConfig) error {
	if len(settings) > 64 {
		return errors.New("too many setting fields")
	}

	m := make(map[string]ProviderConfig)
	for _, config := range configs {
		m[config.Name] = config
	}

	for configName, config := range m {
		v, ok := settings[configName]
		if (!ok || v == nil) && config.Required {
			return errors.New("missing required setting: " + configName)
		}

		if !ok || v == nil {
			continue
		}

		switch config.Type {
		case string(CONFIG_TYPE_TEXT_INPUT):
			if _, ok := v.(string); !ok {
				return errors.New("setting " + configName + " is not a string")
			}
		case string(CONFIG_TYPE_SECRET_INPUT):
			if _, ok := v.(string); !ok {
				return errors.New("setting " + configName + " is not a string")
			}
		case string(CONFIG_TYPE_SELECT):
			if _, ok := v.(string); !ok {
				return errors.New("setting " + configName + " is not a string")
			}
			// check is in options
			found := false
			for _, option := range config.Options {
				if v == option.Value {
					found = true
					break
				}
			}
			if !found {
				return errors.New("setting " + configName + " is not a valid option")
			}
		case string(CONFIG_TYPE_BOOLEAN):
			if _, ok := v.(bool); !ok {
				return errors.New("setting " + configName + " is not a boolean")
			}
		case string(CONFIG_TYPE_APP_SELECTOR):
			s, ok := v.(map[string]any)
			if !ok {
				return errors.New("setting " + configName + " is not a map")
			}
			if _, ok := s["app_id"]; !ok {
				return errors.New("setting " + configName + " is missing app_id")
			}
		case string(CONFIG_TYPE_MODEL_SELECTOR):
			s, ok := v.(map[string]any)
			if !ok {
				return errors.New("setting " + configName + " is not a map")
			}
			if _, ok := s["provider"]; !ok {
				return errors.New("setting " + configName + " is missing provider")
			}
			if _, ok := s["model"]; !ok {
				return errors.New("setting " + configName + " is missing model")
			}
			if _, ok := s["model_type"]; !ok {
				return errors.New("setting " + configName + " is missing model_type")
			}
			// check scope
			if config.Scope != nil {
				switch *config.Scope {
				case string(MODEL_CONFIG_SCOPE_ALL):
					// do nothing
				case string(MODEL_CONFIG_SCOPE_LLM):
				// do nothing
				case string(MODEL_CONFIG_SCOPE_TEXT_EMBEDDING):
					// do nothing
				case string(MODEL_CONFIG_SCOPE_RERANK):
					if _, ok := s["score_threshold"]; !ok {
						return errors.New("setting " + configName + " is missing score_threshold")
					}
					if _, ok := s["top_n"]; !ok {
						return errors.New("setting " + configName + " is missing top_n")
					}
				case string(MODEL_CONFIG_SCOPE_TTS):
					if _, ok := s["voice"]; !ok {
						return errors.New("setting " + configName + " is missing voice")
					}
				case string(MODEL_CONFIG_SCOPE_SPEECH2TEXT):
					// do nothing
				case string(MODEL_CONFIG_SCOPE_MODERATION):
					// do nothing
				case string(MODEL_CONFIG_SCOPE_VISION):
					if _, ok := s["completion_params"]; !ok {
						return errors.New("setting " + configName + " is missing completion_params")
					}
				}
			}
		}
	}
	return nil
}
