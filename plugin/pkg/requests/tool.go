package requests

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type ToolType string

const (
	TOOL_TYPE_BUILTIN  ToolType = "builtin"
	TOOL_TYPE_WORKFLOW ToolType = "workflow"
	TOOL_TYPE_API      ToolType = "api"
	TOOL_TYPE_MCP      ToolType = "mcp"
)

var validToolTypes = map[ToolType]bool{
	TOOL_TYPE_BUILTIN:  true,
	TOOL_TYPE_WORKFLOW: true,
	TOOL_TYPE_API:      true,
	TOOL_TYPE_MCP:      true,
}

func isToolType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validToolTypes[ToolType(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("tool_type", isToolType)
}

type InvokeToolSchema struct {
	Provider       string         `json:"provider" validate:"required"`
	Tool           string         `json:"tool" validate:"required"`
	ToolParameters map[string]any `json:"tool_parameters" validate:"omitempty"`
}

type RequestInvokeTool struct {
	InvokeToolSchema
	Credentials
}

type RequestValidateToolCredentials struct {
	Provider    string         `json:"provider" validate:"required"`
	Credentials map[string]any `json:"credentials" validate:"omitempty"`
}

type RequestGetToolRuntimeParameters struct {
	Provider    string         `json:"provider" validate:"required"`
	Tool        string         `json:"tool" validate:"required"`
	Credentials map[string]any `json:"credentials" validate:"omitempty"`
}
