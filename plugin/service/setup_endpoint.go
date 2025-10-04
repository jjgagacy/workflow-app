package service

import (
	"errors"
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils/encryption"
)

func SetupEndPoint(
	tenantId string,
	userId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	name string,
	settings map[string]any,
) *entities.Response {
	// get installation
	installation, err := db.GetOne[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
	)
	if err != nil {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}
	pluginDeclaration, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		plugin_entities.PluginRuntimeType(installation.RuntimeType),
	)
	if err != nil {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}

	if !pluginDeclaration.Resource.Permission.AllowRegisterEndPoint() {
		return entities.PermissionDeniedError(errors.New("permission denied, you should enable endpoint access in plugin manifest")).ToResponse()
	}

	if pluginDeclaration.EndPoint == nil {
		return entities.PermissionDeniedError(errors.New("permission denied, you should setting EndPoint in plugin manifest")).ToResponse()
	}

	// check settings
	if err := plugin_entities.ValidateProviderConfig(settings, pluginDeclaration.EndPoint.Settings); err != nil {
		return entities.BadRequestError(fmt.Errorf("failed to validate settings: %v", err)).ToResponse()
	}

	endPoint, err := InstallEndPoint(
		pluginUniqueIdentifier,
		installation.ID,
		tenantId,
		userId,
		name,
		map[string]any{},
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to setup endpoint: %v", err)).ToResponse()
	}

	manager := plugin_manager.Manager()
	if manager == nil {
		return entities.InternalError(errors.New("failed to get plugin manager")).ToResponse()
	}

	// encrypt settings
	encryptedSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
		&invocation.InvokeEncryptRequest{
			BaseInvokeRequest: invocation.BaseInvokeRequest{
				TenantID: tenantId,
				UserID:   userId,
				Type:     invocation.INVOKE_TYPE_ENCRYPT,
			},
			InvokeEncryptSchema: invocation.InvokeEncryptSchema{
				Opt:       invocation.ENCRYPT_OPT_ENCRYPT,
				Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
				Identity:  endPoint.ID,
				Data:      settings,
				Config:    pluginDeclaration.EndPoint.Settings,
			},
		},
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to encrypt settings: %v", err)).ToResponse()
	}

	if err := ApplyEndPointUpdate(endPoint, name, encryptedSettings); err != nil {
		return entities.InternalError(fmt.Errorf("failed to update endpoint: %v", err)).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func RemoveEndPoint(endPointId string, tenantId string) *entities.Response {
	endPoint, err := UninstallEndPoint(endPointId, tenantId)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to remove endpoint: %v", err)).ToResponse()
	}

	// clear credential cache
	manager := plugin_manager.Manager()
	if _, err := manager.BackwardsInvocation().InvokeEncrypt(&invocation.InvokeEncryptRequest{
		BaseInvokeRequest: invocation.BaseInvokeRequest{
			TenantID: tenantId,
			UserID:   "",
			Type:     invocation.INVOKE_TYPE_ENCRYPT,
		},
		InvokeEncryptSchema: invocation.InvokeEncryptSchema{
			Opt:       invocation.ENCRYPT_OPT_ENCRYPT,
			Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
			Identity:  endPoint.ID,
		},
	}); err != nil {
		return entities.InternalError(fmt.Errorf("failed to clear credentials cache: %v", err)).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func UpdateEndPoint(
	endPointId string,
	tenantId string,
	userId string,
	name string,
	settings map[string]any,
) *entities.Response {
	endPoint, err := db.GetOne[model.EndPoint](
		db.Equal("id", endPointId),
		db.Equal("tenant_id", tenantId),
	)
	if err != nil {
		return entities.NotFoundError(fmt.Errorf("failed to find endpoint: %v", err)).ToResponse()
	}

	installation, err := db.GetOne[model.PluginInstallation](
		db.Equal("plugin_id", endPoint.PluginID),
		db.Equal("tenant_id", tenantId),
	)
	if err != nil {
		return entities.NotFoundError(fmt.Errorf("failed to find plugin installation: %v", err)).ToResponse()
	}

	pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(installation.PluginUniqueIdentifier)
	if err != nil {
		return entities.UniqueIdentifierInvalidError(fmt.Errorf("failed to parse plugin unique identifier: %v", err)).ToResponse()
	}

	pluginDeclaration, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		plugin_entities.PluginRuntimeType(installation.RuntimeType),
	)
	if err != nil {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}

	if pluginDeclaration.EndPoint == nil {
		return entities.BadRequestError(errors.New("plugin does not have an endpoint")).ToResponse()
	}

	// decrypt original settings
	manager := plugin_manager.Manager()
	if manager == nil {
		return entities.InternalError(errors.New("failed to get plugin manager")).ToResponse()
	}

	originalSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
		&invocation.InvokeEncryptRequest{
			BaseInvokeRequest: invocation.BaseInvokeRequest{
				TenantID: tenantId,
				UserID:   userId,
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
		return entities.InternalError(fmt.Errorf("failed to decrypt setting: %v", err)).ToResponse()
	}

	maskedSettings := encryption.MaskConfigCredentials(originalSettings, pluginDeclaration.EndPoint.Settings)

	// check if the settings is changed, replace the value is the same as masked settings
	for name, value := range settings {
		// skip it if the value is not secret-input
		found := false
		for _, config := range pluginDeclaration.EndPoint.Settings {
			if config.Name == name && config.Type == string(plugin_entities.CONFIG_TYPE_SECRET_INPUT) {
				found = true
				break
			}
		}

		if !found {
			continue
		}

		if maskedSettings[name] == value {
			settings[name] = originalSettings[name]
		}
	}

	// check settings
	if err := plugin_entities.ValidateProviderConfig(settings, pluginDeclaration.EndPoint.Settings); err != nil {
		return entities.BadRequestError(fmt.Errorf("failed to validate settings: %v", err)).ToResponse()
	}

	// encrypt settings
	encryptedSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
		&invocation.InvokeEncryptRequest{
			BaseInvokeRequest: invocation.BaseInvokeRequest{
				TenantID: tenantId,
				UserID:   userId,
				Type:     invocation.INVOKE_TYPE_ENCRYPT,
			},
			InvokeEncryptSchema: invocation.InvokeEncryptSchema{
				Opt:       invocation.ENCRYPT_OPT_ENCRYPT,
				Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
				Identity:  endPoint.ID,
				Data:      settings,
				Config:    pluginDeclaration.EndPoint.Settings,
			},
		},
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to encrypt settings: %v", err)).ToResponse()
	}

	if err := ApplyEndPointUpdate(&endPoint, name, encryptedSettings); err != nil {
		return entities.InternalError(fmt.Errorf("failed to update endpint: %v", err)).ToResponse()
	}

	// clear credentials cache
	if _, err := manager.BackwardsInvocation().InvokeEncrypt(&invocation.InvokeEncryptRequest{
		BaseInvokeRequest: invocation.BaseInvokeRequest{
			TenantID: tenantId,
			UserID:   userId,
			Type:     invocation.INVOKE_TYPE_ENCRYPT,
		},
		InvokeEncryptSchema: invocation.InvokeEncryptSchema{
			Opt:       invocation.ENCRYPT_OPT_CLEAR,
			Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
			Identity:  endPoint.ID,
			Data:      settings,
			Config:    pluginDeclaration.EndPoint.Settings,
		},
	}); err != nil {
		return entities.InternalError(fmt.Errorf("failed to clear credentials cache: %v", err)).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func SetEndPointEnable(endPointId string, tenantId string) *entities.Response {
	if err := EnableEndPoint(endPointId, tenantId); err != nil {
		return entities.InternalError(errors.New("failed to enable endpoint")).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func SetEndPointDisabled(endPointId string, tenantId string) *entities.Response {
	_, err := DisabledEndPoint(endPointId, tenantId)
	if err != nil {
		return entities.InternalError(errors.New("failed to disabled endpoint")).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}
