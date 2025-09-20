package service

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func ListModels(tenantId string, page int, pageSize int) *entities.Response {
	panic("")
}

func ListTools(tenantId string, page int, pageSize int) *entities.Response {
	panic("")
}

func ListPlugins(tenantId string, page int, pageSize int) *entities.Response {
	panic("")
}

// Using plugin_ids to fetch plugin installations
func BatchGetPluginInstallationByIDs(tenantId string, pluginIds []string) *entities.Response {
	panic("")
}

// Check which plugin is missing
func GetMissingPluginInstallations(tenantId string, pluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier) *entities.Response {
	panic("")
}

func GetTool(tenantId string, pluginId string, provier string) *entities.Response {
	panic("")
}

type RequestCheckToolExistence struct {
	PluginID string `json:"plugin_id" validate:"required"`
	Provider string `json:"provider" validate:"required"`
}

func CheckToolExistence(tenantId string, providers []RequestCheckToolExistence) *entities.Response {
	panic("")
}

func ListAgentStrategies(tenantId string, page int, pageSize int) *entities.Response {
	panic("")
}

func GetAgentStrategy(tenantId string, pluginId string, provider string) *entities.Response {
	panic("")
}
