package model_entities

import "github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"

type ValidateCredentialResult struct {
	Result      bool           `json:"result"`
	Credentials map[string]any `json:"credentials"`
}

type GetModelSchemaResponse struct {
	ModelSchema *plugin_entities.ModelDeclaration `json:"model_schema" validate:"omitempty"`
}
