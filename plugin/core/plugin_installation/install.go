package plugin_installation

import (
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"gorm.io/gorm"
)

func AtomicInstallPlugin(
	tenantID string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installType plugin_entities.PluginRuntimeType,
	declaration *plugin_entities.PluginDeclaration,
	source string,
	meta map[string]any,
) (*model.Plugin, *model.PluginInstallation, error) {
	var resultPlugin *model.Plugin
	var resultInstallation *model.PluginInstallation

	_, err := db.GetOne[model.PluginInstallation](
		db.Equal("plugin_id", pluginUniqueIdentifier.PluginID()),
		db.Equal("tenant_id", tenantID),
	)
	if err == nil {
		return nil, nil, types.ErrPluginAlreadyExists
	}

	err = db.WithTransaction(func(tx *gorm.DB) error {
		plugin, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("plugin_id", pluginUniqueIdentifier.PluginID()),
			db.Equal("install_type", string(installType)),
			db.WLock(),
		)

		if err == types.ErrRecordNotFound {
			plugin = model.Plugin{
				PluginID:               pluginUniqueIdentifier.PluginID(),
				PluginUniqueIdentifier: pluginUniqueIdentifier.String(),
				InstallType:            installType,
				Refers:                 1,
			}

			if installType == plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE {
				plugin.RemoteDeclaration = *declaration
			}

			if err := db.Create(&plugin, tx); err != nil {
				return err
			}
			resultPlugin = &plugin
		} else if err != nil {
			return err
		} else {
			plugin.Refers++
			if err := db.Update(&plugin, tx); err != nil {
				return err
			}
			resultPlugin = &plugin
		}

		if err := db.DeleteBy(model.PluginInstallation{
			PluginID:    pluginUniqueIdentifier.PluginID(),
			RuntimeType: string(installType),
			TenantID:    tenantID,
		}, tx); err != nil {
			return err
		}

		installation := &model.PluginInstallation{
			PluginID:               string(pluginUniqueIdentifier.PluginID()),
			PluginUniqueIdentifier: string(pluginUniqueIdentifier.String()),
			TenantID:               tenantID,
			RuntimeType:            string(installType),
			Source:                 source,
			Meta:                   meta,
		}
		if err := db.Create(installation, tx); err != nil {
			return err
		}
		resultInstallation = installation

		if declaration.Tool != nil {
			if err := db.Create(&model.ToolInstallation{
				PluginID:               resultPlugin.PluginID,
				PluginUniqueIdentifier: resultPlugin.PluginUniqueIdentifier,
				TenantID:               tenantID,
				Provider:               declaration.Tool.Identity.Name,
			}, tx); err != nil {
				return err
			}
		}

		if declaration.AgentStrategy != nil {
			if err := db.Create(&model.AgentStrategyInstallation{
				PluginID:               resultPlugin.PluginID,
				PluginUniqueIdentifier: resultPlugin.PluginUniqueIdentifier,
				TenantID:               tenantID,
				Provider:               declaration.AgentStrategy.Identity.Name,
			}, tx); err != nil {
				return err
			}
		}

		if declaration.Model != nil {
			if err := db.Create(&model.AIModelInstallation{
				PluginID:               resultPlugin.PluginID,
				PluginUniqueIdentifier: resultInstallation.PluginUniqueIdentifier,
				TenantID:               tenantID,
				Provider:               declaration.Model.Provider,
			}, tx); err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, nil, err
	}

	return resultPlugin, resultInstallation, nil
}

type DeletePluginResponse struct {
	Plugin        *model.Plugin
	Installation  *model.PluginInstallation
	PluginDeleted bool
}

func AtomicUninstallPlugin(
	tenantID string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installationID string,
	declaration *plugin_entities.PluginDeclaration,
) (*DeletePluginResponse, error) {
	var resultPlugin *model.Plugin
	var resultInstallation *model.PluginInstallation

	_, err := db.GetOne[model.PluginInstallation](
		db.Equal("id", installationID),
		db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
		db.Equal("tenant_id", tenantID),
	)
	if err != nil {
		if err == types.ErrRecordNotFound {
			return nil, types.ErrPluginHasUninstalled
		}
		return nil, err
	}

	err = db.WithTransaction(func(tx *gorm.DB) error {
		plugin, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.WLock(),
		)
		if err == types.ErrRecordNotFound {
			return types.ErrPluginHasUninstalled
		}
		if err != nil {
			return err
		}

		plugin.Refers--
		if err := db.Update(&plugin, tx); err != nil {
			return err
		}
		resultPlugin = &plugin

		installation, err := db.GetOne[model.PluginInstallation](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("tenant_id", tenantID),
		)
		if err == types.ErrRecordNotFound {
			return types.ErrPluginHasUninstalled
		}
		if err != nil {
			return err
		}
		if err := db.Delete(&installation, tx); err != nil {
			return err
		}
		resultInstallation = &installation

		if declaration.Tool != nil {
			if err := db.DeleteBy(&model.ToolInstallation{
				PluginID: resultPlugin.PluginID,
				TenantID: tenantID,
			}, tx); err != nil {
				return err
			}
		}

		if declaration.AgentStrategy != nil {
			if err := db.DeleteBy(&model.AgentStrategyInstallation{
				PluginID: resultPlugin.PluginID,
				TenantID: tenantID,
			}, tx); err != nil {
				return err
			}
		}

		if declaration.Model != nil {
			if err := db.DeleteBy(&model.AIModelInstallation{
				PluginID: resultPlugin.PluginID,
				TenantID: tenantID,
			}, tx); err != nil {
				return err
			}
		}

		if resultPlugin.Refers == 0 {
			if err := db.Delete(resultPlugin, tx); err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &DeletePluginResponse{
		Plugin:        resultPlugin,
		Installation:  resultInstallation,
		PluginDeleted: resultPlugin.Refers == 0,
	}, nil
}
