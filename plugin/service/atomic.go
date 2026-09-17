package service

import (
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_installation"
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
	return plugin_installation.AtomicInstallPlugin(
		tenantId,
		pluginUniqueIdentifier,
		installType,
		declaration,
		source,
		meta,
	)
}

type DeletePluginResponse = plugin_installation.DeletePluginResponse

// AtomicUninstallPlugin delete plugin for a tenant
func AtomicUninstallPlugin(
	tenantId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installationId string,
	declaration *plugin_entities.PluginDeclaration,
) (*DeletePluginResponse, error) {
	return plugin_installation.AtomicUninstallPlugin(
		tenantId,
		pluginUniqueIdentifier,
		installationId,
		declaration,
	)
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
