package dynamic_select_entities

import "github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"

type DynamicSelectResult struct {
	Options []plugin_entities.ParameterOption `json:"option" validate:"omitempty,dive"`
}
