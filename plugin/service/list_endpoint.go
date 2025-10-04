package service

import (
	"errors"
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils/encryption"
)

func ListEndPoints(tenantId string, page int, pageSize int) *entities.Response {
	endPoints, err := db.GetAll[model.EndPoint](
		db.Equal("tenant_id", tenantId),
		db.OrderBy("created_at", true),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to list endpoints: %v", err)).ToResponse()
	}

	manager := plugin_manager.Manager()
	if manager == nil {
		return entities.InternalError(errors.New("failed to get plugin manager")).ToResponse()
	}

	// decrypt settings
	for i, endPoint := range endPoints {
		pluginInstallation, err := db.GetOne[model.PluginInstallation](
			db.Equal("tenant_id", tenantId),
			db.Equal("plugin_id", endPoint.PluginID),
		)
		if err != nil {
			// returns empty settings and declarations for uninstall plugins
			endPoint.Settings = map[string]any{}
			endPoint.Declaration = &plugin_entities.EndPointProviderDeclaration{
				Settings:      []plugin_entities.ProviderConfig{},
				EndPoints:     []plugin_entities.EndPointDeclaration{},
				EndPointFiles: []string{},
			}
			endPoints[i] = endPoint
			continue
		}

		pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(
			pluginInstallation.PluginUniqueIdentifier,
		)
		if err != nil {
			return entities.UniqueIdentifierInvalidError(fmt.Errorf("failed to parse plugin unique identifier: %v", err)).ToResponse()
		}

		pluginDeclaration, err := manager.GetPluginDeclaration(
			pluginUniqueIdentifier,
			plugin_entities.PluginRuntimeType(pluginInstallation.RuntimeType),
		)
		if err != nil {
			return entities.InternalError(fmt.Errorf("failed to get plugin declaration: %v", err)).ToResponse()
		}

		if pluginDeclaration.EndPoint == nil {
			return entities.NotFoundError(errors.New("plugin does not have an endpoint")).ToResponse()
		}

		decryptedSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
			&invocation.InvokeEncryptRequest{
				BaseInvokeRequest: invocation.BaseInvokeRequest{
					TenantID: tenantId,
					UserID:   "",
					Type:     invocation.INVOKE_TYPE_ENCRYPT,
				},
				InvokeEncryptSchema: invocation.InvokeEncryptSchema{
					Opt:       invocation.ENCRYPT_OPT_DECRYPT,
					Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
					Identity:  endPoint.ID,
					Data:      endPoint.Settings,
					Config:    pluginDeclaration.EndPoint.Settings,
				},
			},
		)

		if err != nil {
			return entities.InternalError(fmt.Errorf("failed to decrypt settings: %v", err)).ToResponse()
		}

		// mask settings
		decryptedSettings = encryption.MaskConfigCredentials(decryptedSettings, pluginDeclaration.EndPoint.Settings)

		endPoint.Settings = decryptedSettings
		endPoint.Declaration = pluginDeclaration.EndPoint

		endPoints[i] = endPoint
	}

	return entities.NewSuccessResponse(endPoints)
}

func ListPluginEndPoints(tenantId string, pluginId string, page int, pageSize int) *entities.Response {
	endPoints, err := db.GetAll[model.EndPoint](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
		db.OrderBy("created_at", true),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to list endpoints: %v", err)).ToResponse()
	}

	manager := plugin_manager.Manager()
	if manager == nil {
		return entities.InternalError(errors.New("failed to get plugin manager")).ToResponse()
	}

	// decrypt settings
	for i, endPoint := range endPoints {
		pluginInstallation, err := db.GetOne[model.PluginInstallation](
			db.Equal("tenant_id", tenantId),
			db.Equal("plugin_id", endPoint.PluginID),
		)
		if err != nil {
			return entities.NotFoundError(fmt.Errorf("failed to find plugin installation: %v", err)).ToResponse()
		}

		pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(
			pluginInstallation.PluginUniqueIdentifier,
		)
		if err != nil {
			return entities.UniqueIdentifierInvalidError(fmt.Errorf("failed to parse plugin unique identifier: %v", err)).ToResponse()
		}

		pluginDeclaration, err := manager.GetPluginDeclaration(
			pluginUniqueIdentifier,
			plugin_entities.PluginRuntimeType(pluginInstallation.RuntimeType),
		)
		if err != nil {
			return entities.InternalError(fmt.Errorf("failed to get plugin declaration: %v", err)).ToResponse()
		}

		if pluginDeclaration.EndPoint == nil {
			return entities.NotFoundError(errors.New("plugin does not have an endpoint")).ToResponse()
		}

		decryptedSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
			&invocation.InvokeEncryptRequest{
				BaseInvokeRequest: invocation.BaseInvokeRequest{
					TenantID: tenantId,
					UserID:   "",
					Type:     invocation.INVOKE_TYPE_ENCRYPT,
				},
				InvokeEncryptSchema: invocation.InvokeEncryptSchema{
					Opt:       invocation.ENCRYPT_OPT_DECRYPT,
					Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
					Identity:  endPoint.ID,
					Data:      endPoint.Settings,
					Config:    pluginDeclaration.EndPoint.Settings,
				},
			},
		)

		if err != nil {
			return entities.InternalError(fmt.Errorf("failed to decrypt settings: %v", err)).ToResponse()
		}

		// mask settings
		decryptedSettings = encryption.MaskConfigCredentials(decryptedSettings, pluginDeclaration.EndPoint.Settings)

		endPoint.Settings = decryptedSettings
		endPoint.Declaration = pluginDeclaration.EndPoint

		endPoints[i] = endPoint
	}

	return entities.NewSuccessResponse(endPoints)
}
