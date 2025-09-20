package service

import (
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"gorm.io/gorm"
)

func AtomicInstallPlugin(
	tenantId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installType plugin_entities.PluginRuntimeType,
	declaration *plugin_entities.PluginDeclaration,
	source string,
	meta map[string]any,
) (*model.Plugin, *model.PluginInstallation, error) {
	var rPlugin *model.Plugin
	var rInstallation *model.PluginInstallation

	// check if the plugin already exists
	_, err := db.GetOne[model.PluginInstallation](
		db.Equal("plugin_id", pluginUniqueIdentifier.PluginID()),
		db.Equal("tenant_id", tenantId),
	)
	if err == nil {
		return nil, nil, ErrPluginAlreadyExists
	}

	err = db.WithTransaction(func(tx *gorm.DB) error {
		p, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("plugin_id", pluginUniqueIdentifier.PluginID()),
			db.Equal("install_type", string(installType)),
			db.WLock(),
		)

		if err == ErrRecordNotFound {
			plugin := &model.Plugin{
				PluginID:               pluginUniqueIdentifier.PluginID(),
				PluginUniqueIdentifier: pluginUniqueIdentifier.String(),
				InstallType:            installType,
				Refers:                 1,
			}

			if installType == plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE {
				plugin.RemoteDeclaration = *declaration
			}

			err := db.Create(plugin, tx)
			if err != nil {
				return err
			}

			rPlugin = plugin
		} else if err != nil {
			return err
		} else {
			p.Refers += 1
			err := db.Update(&p, tx)
			if err != nil {
				return err
			}
			rPlugin = &p
		}

		// remove existence installation
		if err := db.DeleteBy(
			model.PluginInstallation{
				PluginID:    pluginUniqueIdentifier.PluginID(),
				RuntimeType: string(installType),
				TenantID:    tenantId,
			},
			tx,
		); err != nil {
			return err
		}

		// create installation
		installation := &model.PluginInstallation{
			PluginID:               string(pluginUniqueIdentifier.PluginID()),
			PluginUniqueIdentifier: string(pluginUniqueIdentifier.String()),
			TenantID:               tenantId,
			RuntimeType:            string(installType),
			Source:                 source,
			Meta:                   meta,
		}

		err = db.Create(installation, tx)
		if err != nil {
			return err
		}

		rInstallation = installation

		// create agent installation
		if declaration.AgentStrategy != nil {
			agentStrategyInstallation := &model.AgentStrategyInstallation{
				PluginID:               rPlugin.PluginID,
				PluginUniqueIdentifier: rPlugin.PluginUniqueIdentifier,
				TenantID:               tenantId,
				Provider:               declaration.AgentStrategy.Identity.Name,
			}

			if err := db.Create(agentStrategyInstallation, tx); err != nil {
				return err
			}
		}

		// create ai model installation
		if declaration.Model != nil {
			aiModelInstallation := &model.AIModelInstallation{
				PluginID:               rPlugin.PluginID,
				PluginUniqueIdentifier: rInstallation.PluginUniqueIdentifier,
				TenantID:               tenantId,
				Provider:               declaration.Model.Provider,
			}

			if err := db.Create(aiModelInstallation, tx); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return rPlugin, rInstallation, nil
}

type DeletePluginResponse struct {
	Plugin       *model.Plugin
	Installation *model.PluginInstallation
	// whether the refers of the plugin has decreased to 0
	// which means the whole plugin has been uninstalled, not just the installation
	PluginDeleted bool
}

func AtomicUninstallPlugin(
	tenantId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installationId string,
	declaration *plugin_entities.PluginDeclaration,
) (*DeletePluginResponse, error) {
	panic("")
}

type UpgradePluginResponse struct {
	// Whether the original plugin has been deleted
	OriginalPluginDeleted bool
	// the deleted plugin
	DeletedPlugin *model.Plugin
}

func AtomicUpgradePlugin(
	tenantId string,
	originalPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	newPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	newDeclaration *plugin_entities.PluginDeclaration,
	installType plugin_entities.PluginRuntimeType,
	meta map[string]any,
) (*UpgradePluginResponse, error) {
	panic("")
}
