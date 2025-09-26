package service

import (
	"errors"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
)

func ListModels(tenantId string, page int, pageSize int) *entities.Response {
	type AIModel struct {
		model.AIModelInstallation

		Declaration *plugin_entities.ModelProviderDeclaration `json:"declaration"`
	}

	aiModelInstallations, err := db.GetAll[model.AIModelInstallation](
		db.Equal("tenant_id", tenantId),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	data := make([]AIModel, 0, len(aiModelInstallations))

	for _, aiModelInstallation := range aiModelInstallations {
		pluginUniqueIdentifier := plugin_entities.PluginUniqueIdentifier(aiModelInstallation.PluginUniqueIdentifier)
		var runtimeType plugin_entities.PluginRuntimeType
		if pluginUniqueIdentifier.RemoteLike() {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
		} else {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
		}

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			runtimeType,
		)
		if err != nil {
			return entities.InternalError(err).ToResponse()
		}

		data = append(data, AIModel{
			AIModelInstallation: aiModelInstallation,
			Declaration:         declaration.Model,
		})
	}

	return entities.NewSuccessResponse(data)
}

func ListTools(tenantId string, page int, pageSize int) *entities.Response {
	type Tool struct {
		model.ToolInstallation

		Declaration *plugin_entities.ToolProviderDeclaration `json:"declaration"`
	}

	toolInstallations, err := db.GetAll[model.ToolInstallation](
		db.Equal("tenant_id", tenantId),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	data := make([]Tool, len(toolInstallations))
	for _, toolInstallation := range toolInstallations {
		pluginUniqueIdentifier := plugin_entities.PluginUniqueIdentifier(toolInstallation.PluginUniqueIdentifier)
		var runtimeType plugin_entities.PluginRuntimeType
		if pluginUniqueIdentifier.RemoteLike() {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
		} else {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
		}

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			runtimeType,
		)
		if err != nil {
			return entities.InternalError(err).ToResponse()
		}

		data = append(data, Tool{
			ToolInstallation: toolInstallation,
			Declaration:      declaration.Tool,
		})
	}

	return entities.NewSuccessResponse(data)
}

func ListPlugins(tenantId string, page int, pageSize int) *entities.Response {
	type installations struct {
		ID                     string                             `json:"id"`
		Name                   string                             `json:"name"`
		PluginID               string                             `json:"plugin_id"`
		TenantID               string                             `json:"tenant_id"`
		PluginUniqueIdentifier string                             `json:"plugin_unique_identifier"`
		EndPointActive         int                                `json:"end_point_active"`
		EndPointSetups         int                                `json:"end_point_setups"`
		InstallationID         string                             `json:"installation_id"`
		Declaration            *plugin_entities.PluginDeclaration `json:"declaration"`
		RuntimeType            plugin_entities.PluginRuntimeType  `json:"runtime_type"`
		Version                manifest_entites.Version           `json:"version"`
		CreatedAt              time.Time                          `json:"created_at"`
		UpdatedAt              time.Time                          `json:"updated_at"`
		Source                 string                             `json:"source"`
		Checksum               string                             `json:"checksum"`
		Meta                   map[string]any                     `json:"meta"`
	}

	type responseData struct {
		List  []installations `json:"list"`
		Total int64           `json:"total"`
	}

	// get total
	totalCount, err := db.GetCount[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	pluginInstallations, err := db.GetAll[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.OrderBy("created_at", true),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	data := make([]installations, 0, len(pluginInstallations))

	for _, installation := range pluginInstallations {
		pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(
			installation.PluginUniqueIdentifier,
		)
		if err != nil {
			return entities.UniqueIdentifierInvalidError(err).ToResponse()
		}

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			plugin_entities.PluginRuntimeType(installation.RuntimeType),
		)
		if err != nil {
			return entities.InternalError(err).ToResponse()
		}

		data = append(data, installations{
			ID:                     installation.ID,
			Name:                   declaration.Name,
			TenantID:               installation.TenantID,
			PluginID:               pluginUniqueIdentifier.PluginID(),
			PluginUniqueIdentifier: pluginUniqueIdentifier.String(),
			InstallationID:         installation.ID,
			Declaration:            declaration,
			RuntimeType:            plugin_entities.PluginRuntimeType(installation.RuntimeType),
			EndPointSetups:         installation.EndPointSetups,
			EndPointActive:         installation.EndPointActive,
			Version:                declaration.Version,
			CreatedAt:              installation.CreatedAt,
			UpdatedAt:              installation.UpdatedAt,
			Source:                 installation.Source,
			Meta:                   installation.Meta,
			Checksum:               pluginUniqueIdentifier.Checksum(),
		})
	}

	respData := responseData{
		List:  data,
		Total: totalCount,
	}

	return entities.NewSuccessResponse(respData)
}

// Using plugin_ids to fetch plugin installations
func BatchGetPluginInstallationByIDs(tenantId string, pluginIds []string) *entities.Response {
	panic("")
}

// Check which plugin is missing
func GetMissingPluginInstallations(tenantId string, pluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier) *entities.Response {
	panic("")
}

func GetTool(tenantId string, pluginId string, provider string) *entities.Response {
	type Tool struct {
		model.ToolInstallation

		Declaration *plugin_entities.ToolProviderDeclaration `json:"declaration"`
	}

	tool, err := db.GetOne[model.ToolInstallation](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
	)

	if err != nil {
		if err == types.ErrRecordNotFound {
			return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
		}
		return entities.InternalError(err).ToResponse()
	}

	if tool.Provider != provider {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}

	pluginUniqueIdentifier := plugin_entities.PluginUniqueIdentifier(tool.PluginUniqueIdentifier)
	var runtimeType plugin_entities.PluginRuntimeType
	if pluginUniqueIdentifier.RemoteLike() {
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
	} else {
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
	}

	declaration, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		runtimeType,
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(Tool{
		ToolInstallation: tool,
		Declaration:      declaration.Tool,
	})
}

type RequestCheckToolExistence struct {
	PluginID string `json:"plugin_id" validate:"required"`
	Provider string `json:"provider" validate:"required"`
}

func CheckToolExistence(tenantId string, providers []RequestCheckToolExistence) *entities.Response {
	data := make([]bool, 0, len(providers))

	pluginIds := make([]interface{}, len(providers))
	for i, provider := range providers {
		pluginIds[i] = provider.PluginID
	}

	toolInstallations, err := db.GetAll[model.ToolInstallation](
		db.Equal("tenant_id", tenantId),
		db.InArray("plugin_id", pluginIds),
		db.Page(1, 256),
	)

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	for _, provider := range providers {
		found := false
		for _, toolInstallation := range toolInstallations {
			if provider.PluginID == toolInstallation.PluginID && provider.Provider == toolInstallation.Provider {
				found = true
			}
		}

		data = append(data, found)
	}

	return entities.NewSuccessResponse(data)
}

func ListAgentStrategies(tenantId string, page int, pageSize int) *entities.Response {
	type AgentStrategy struct {
		model.AgentStrategyInstallation

		Declaration *plugin_entities.AgentStrategyProviderDeclaration `json:"declaration"`
		Meta        plugin_entities.PluginMeta                        `json:"meta"`
	}

	agentStrategies, err := db.GetAll[model.AgentStrategyInstallation](
		db.Equal("tenant_id", tenantId),
		db.Page(page, pageSize),
	)

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	data := make([]AgentStrategy, 0, len(agentStrategies))

	for _, agentStrategy := range agentStrategies {
		pluginUniqueIdentifier := plugin_entities.PluginUniqueIdentifier(agentStrategy.PluginUniqueIdentifier)
		var runtimeType plugin_entities.PluginRuntimeType
		if pluginUniqueIdentifier.RemoteLike() {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
		} else {
			runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
		}

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			runtimeType,
		)
		if err != nil {
			return entities.InternalError(err).ToResponse()
		}

		data = append(data, AgentStrategy{
			AgentStrategyInstallation: agentStrategy,
			Declaration:               declaration.AgentStrategy,
			Meta:                      declaration.Meta,
		})
	}

	return entities.NewSuccessResponse(data)
}

func GetAgentStrategy(tenantId string, pluginId string, provider string) *entities.Response {
	type AgentStrategy struct {
		model.AgentStrategyInstallation

		Declaration *plugin_entities.AgentStrategyProviderDeclaration `json:"declaration"`
		Meta        plugin_entities.PluginMeta                        `json:"meta"`
	}

	agentStrategy, err := db.GetOne[model.AgentStrategyInstallation](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
	)

	if err != nil {
		if err == types.ErrRecordNotFound {
			return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
		}
		return entities.InternalError(err).ToResponse()
	}

	if agentStrategy.Provider != provider {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}

	pluginUniqueIdentifier := plugin_entities.PluginUniqueIdentifier(agentStrategy.PluginUniqueIdentifier)
	var runtimeType plugin_entities.PluginRuntimeType
	if pluginUniqueIdentifier.RemoteLike() {
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
	} else {
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
	}

	declaration, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		runtimeType,
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(AgentStrategy{
		AgentStrategyInstallation: agentStrategy,
		Declaration:               declaration.AgentStrategy,
		Meta:                      declaration.Meta,
	})
}

func BatchFetchPluginInstallationByIDs(tenantId string, pluginIds []string) *entities.Response {
	type installation struct {
		model.PluginInstallation

		Version     manifest_entites.Version           `json:"version"`
		Checksum    string                             `json:"checksum"`
		Declaration *plugin_entities.PluginDeclaration `json:"declaration"`
	}

	if len(pluginIds) == 0 {
		return entities.NewSuccessResponse([]installation{})
	}

	// convert []string to []interface{}
	pluginIdsInterface := make([]interface{}, len(pluginIds))
	for i, id := range pluginIds {
		pluginIdsInterface[i] = id
	}
	pluginInstallations, err := db.GetAll[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.InArray("plugin_id", pluginIdsInterface),
		db.Page(1, 256),
	)

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	data := make([]installation, 0, len(pluginInstallations))

	for _, pluginInstallation := range pluginInstallations {
		pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(
			pluginInstallation.PluginUniqueIdentifier,
		)
		if err != nil {
			return entities.InternalError(errors.Join(err, errors.New("invalid plugin unique identifier found"))).ToResponse()
		}

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			plugin_entities.PluginRuntimeType(pluginInstallation.RuntimeType),
		)

		if err != nil {
			return entities.InternalError(errors.Join(err, errors.New("failed to get plugin declaration"))).ToResponse()
		}

		data = append(data, installation{
			PluginInstallation: pluginInstallation,
			Version:            manifest_entites.Version(pluginUniqueIdentifier.Version()),
			Checksum:           pluginUniqueIdentifier.Checksum(),
			Declaration:        declaration,
		})
	}

	return entities.NewSuccessResponse(data)
}

func FetchMissingPluginInstallations(tenantId string, pluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier) *entities.Response {
	type MissingPluginDependency struct {
		PluginUniqueIdentifier string `json:"plugin_unique_identifier"`
		CurrentIdentifier      string `json:"current_identifier"`
	}

	data := make([]MissingPluginDependency, 0, len(pluginUniqueIdentifiers))

	if len(pluginUniqueIdentifiers) == 0 {
		return entities.NewSuccessResponse(data)
	}

	pluginIdsInterface := make([]interface{}, len(pluginUniqueIdentifiers))
	for i, id := range pluginUniqueIdentifiers {
		pluginIdsInterface[i] = id.PluginID()
	}
	installations, err := db.GetAll[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.InArray("plugin_id", pluginIdsInterface),
		db.Page(1, 256),
	)

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	// chekck which plugin is missing
	for _, pluginUniqueIdentifier := range pluginUniqueIdentifiers {
		found := false
		for _, installation := range installations {
			if installation.PluginID == pluginUniqueIdentifier.PluginID() {
				found = true
				// version mismatch
				if installation.PluginUniqueIdentifier != string(pluginUniqueIdentifier) {
					data = append(data, MissingPluginDependency{
						PluginUniqueIdentifier: string(pluginUniqueIdentifier),
						CurrentIdentifier:      installation.PluginUniqueIdentifier,
					})
				}
				break
			}
		}
		if !found {
			data = append(data, MissingPluginDependency{
				PluginUniqueIdentifier: string(pluginUniqueIdentifier),
			})
		}
	}

	return entities.NewSuccessResponse(data)
}
