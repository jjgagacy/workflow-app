package service

import (
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
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
	// exists
	if err == nil {
		return nil, nil, types.ErrPluginAlreadyExists
	}

	err = db.WithTransaction(func(tx *gorm.DB) error {
		p, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("plugin_id", pluginUniqueIdentifier.PluginID()),
			db.Equal("install_type", string(installType)),
			db.WLock(),
		)

		if err == types.ErrRecordNotFound {
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

		// create tool installation
		if declaration.Tool != nil {
			toolInstallation := &model.ToolInstallation{
				PluginID:               rPlugin.PluginID,
				PluginUniqueIdentifier: rPlugin.PluginUniqueIdentifier,
				TenantID:               tenantId,
				Provider:               declaration.Tool.Identity.Name,
			}

			err := db.Create(toolInstallation, tx)
			if err != nil {
				return err
			}
		}

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

// AtomicUninstallPlugin delete plugin for a tenant
func AtomicUninstallPlugin(
	tenantId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installationId string,
	declaration *plugin_entities.PluginDeclaration,
) (*DeletePluginResponse, error) {
	var rPlugin *model.Plugin
	var rInstallation *model.PluginInstallation

	_, err := db.GetOne[model.PluginInstallation](
		db.Equal("id", installationId),
		db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
		db.Equal("tenant_id", tenantId),
	)

	// check plugin has been uninstalled
	if err != nil {
		if err == types.ErrRecordNotFound {
			return nil, types.ErrPluginHasUninstalled
		} else {
			return nil, err
		}
	}

	err = db.WithTransaction(func(tx *gorm.DB) error {
		plugin, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.WLock(),
		)

		if err == types.ErrRecordNotFound {
			return types.ErrPluginHasUninstalled
		} else if err != nil {
			return err
		} else {
			plugin.Refers--
			err := db.Update(&plugin, tx)
			if err != nil {
				return err
			}
			rPlugin = &plugin
		}

		// delete plugin installation
		installation, err := db.GetOne[model.PluginInstallation](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("tenant_id", tenantId),
		)

		if err == types.ErrRecordNotFound {
			return types.ErrPluginHasUninstalled
		} else if err != nil {
			return err
		} else {
			err := db.Delete(&installation, tx)
			if err != nil {
				return err
			}
			rInstallation = &installation
		}

		// delete tool installation
		if declaration.Tool != nil {
			toolInstallation := &model.ToolInstallation{
				PluginID: rPlugin.PluginID,
				TenantID: tenantId,
			}

			err := db.DeleteBy(&toolInstallation, tx)
			if err != nil {
				return err
			}
		}

		// delete agent installation
		if declaration.AgentStrategy != nil {
			agentStrategyInstallation := &model.AgentStrategyInstallation{
				PluginID: rPlugin.PluginID,
				TenantID: tenantId,
			}

			err := db.DeleteBy(&agentStrategyInstallation, tx)
			if err != nil {
				return err
			}
		}

		// delete model installation
		if declaration.Model != nil {
			modelInstallation := &model.AIModelInstallation{
				PluginID: rPlugin.PluginID,
				TenantID: tenantId,
			}

			err := db.DeleteBy(&modelInstallation, tx)
			if err != nil {
				return err
			}
		}

		if rPlugin.Refers == 0 {
			err := db.Delete(&rPlugin, tx)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &DeletePluginResponse{
		Plugin:        rPlugin,
		Installation:  rInstallation,
		PluginDeleted: rPlugin.Refers == 0,
	}, nil
}

type UpgradePluginResponse struct {
	// Whether the original plugin has been deleted
	OriginalPluginDeleted bool
	// the deleted plugin
	DeletedPlugin *model.Plugin
}

// AtomicUpgradePlugin upgrade plugin for a tenant
func AtomicUpgradePlugin(
	tenantId string,
	originalPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	newPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	originalDeclaration *plugin_entities.PluginDeclaration,
	newDeclaration *plugin_entities.PluginDeclaration,
	installType plugin_entities.PluginRuntimeType,
	source string,
	meta map[string]any,
) (*UpgradePluginResponse, error) {
	var response UpgradePluginResponse

	err := db.WithTransaction(func(tx *gorm.DB) error {
		installation, err := db.GetOne[model.PluginInstallation](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", originalPluginUniqueIdentifier.String()),
			db.Equal("tenant_id", tenantId),
			db.WLock(),
		)

		if err == types.ErrRecordNotFound {
			return types.ErrPluginNotInstalled
		} else if err != nil {
			return err
		}

		// check if new plugin exists
		plugin, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", newPluginUniqueIdentifier.String()),
		)

		if err == types.ErrRecordNotFound {
			// create new plugin
			plugin = model.Plugin{
				PluginID:               newPluginUniqueIdentifier.PluginID(),
				PluginUniqueIdentifier: newPluginUniqueIdentifier.String(),
				InstallType:            installType,
				Refers:                 0,
				ManifestType:           manifest_entites.PluginType,
			}

			err := db.Create(&plugin, tx)
			if err != nil {
				return err
			}
		} else if err != nil {
			return err
		}

		// update installation
		installation.PluginUniqueIdentifier = string(newPluginUniqueIdentifier)
		installation.Meta = meta
		installation.Source = source
		installation.PluginID = newPluginUniqueIdentifier.PluginID()
		err = db.Update(installation, tx)
		if err != nil {
			return err
		}

		// decrease the refers of the original plugin
		err = db.Run(
			db.WithTransactionContext(tx),
			db.Model(&model.Plugin{}),
			db.Equal("plugin_unique_identifier", originalPluginUniqueIdentifier.String()),
			db.Inc(map[string]int{"refers": -1}),
		)
		if err != nil {
			return err
		}

		// delete the original plugin if refers is 0
		originalPlugin, err := db.GetOne[model.Plugin](
			db.WithTransactionContext(tx),
			db.Equal("plugin_unique_identifier", originalPluginUniqueIdentifier.String()),
		)

		if err == nil && originalPlugin.Refers == 0 {
			err := db.Delete(&originalPlugin, tx)
			if err != nil {
				return err
			}
			response.OriginalPluginDeleted = true
			response.DeletedPlugin = &originalPlugin
		} else if err != nil {
			return err
		}

		// increase the refers of the new plugin
		err = db.Run(
			db.WithTransactionContext(tx),
			db.Model(&model.Plugin{}),
			db.Equal("plugin_unique_identifier", newPluginUniqueIdentifier.String()),
			db.Inc(map[string]int{"refers": 1}),
		)

		if err != nil {
			return err
		}

		// update AiModelInstallation
		if originalDeclaration.Model != nil {
			// delete the original
			err := db.DeleteBy(&model.AIModelInstallation{
				PluginID: originalPlugin.PluginID,
				TenantID: tenantId,
			}, tx)

			if err != nil {
				return err
			}
		}

		if newDeclaration.Model != nil {
			modelInstallation := &model.AIModelInstallation{
				PluginUniqueIdentifier: newPluginUniqueIdentifier.String(),
				TenantID:               tenantId,
				Provider:               newDeclaration.Model.Provider,
				PluginID:               newPluginUniqueIdentifier.PluginID(),
			}

			err := db.Create(modelInstallation, tx)
			if err != nil {
				return err
			}
		}

		// update tool installation
		if originalDeclaration.Tool != nil {
			// delete the original
			err := db.DeleteBy(&model.ToolInstallation{
				PluginID: originalPluginUniqueIdentifier.PluginID(),
				TenantID: tenantId,
			})

			if err != nil {
				return err
			}
		}

		if newDeclaration.Tool != nil {
			// create the tool installation
			toolInstallation := &model.ToolInstallation{
				PluginUniqueIdentifier: string(newPluginUniqueIdentifier),
				TenantID:               tenantId,
				Provider:               newDeclaration.Tool.Identity.Name,
				PluginID:               newPluginUniqueIdentifier.PluginID(),
			}

			err := db.Create(toolInstallation, tx)
			if err != nil {
				return err
			}
		}

		// update agent installation
		if originalDeclaration.AgentStrategy != nil {
			// delete the original
			err := db.DeleteBy(&model.AgentStrategyInstallation{
				PluginID: originalPluginUniqueIdentifier.PluginID(),
				TenantID: tenantId,
			}, tx)

			if err != nil {
				return err
			}
		}

		if newDeclaration.AgentStrategy != nil {
			// create the new agent
			agentStrategyInstallation := &model.AgentStrategyInstallation{
				PluginUniqueIdentifier: string(newPluginUniqueIdentifier),
				TenantID:               tenantId,
				Provider:               newDeclaration.AgentStrategy.Identity.Name,
				PluginID:               newPluginUniqueIdentifier.PluginID(),
			}

			err := db.Create(agentStrategyInstallation, tx)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &response, nil
}
