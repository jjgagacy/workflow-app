package debugging_runtime

import (
	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_installation"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func (r *RemotePluginRuntime) Register() error {
	identity, err := r.Identity()
	if err != nil {
		return err
	}
	config := r.Configuration()

	_, installation, err := plugin_installation.AtomicInstallPlugin(
		r.tenantId,
		identity,
		plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE,
		config,
		"remote",
		map[string]any{},
	)
	if err != nil {
		return err
	}
	r.installationId = installation.ID
	return nil
}

func (r *RemotePluginRuntime) Unregister() error {
	identity, err := r.Identity()
	if err != nil {
		return err
	}
	declaration, err := cache.CombinedGetPluginDeclaration(
		identity,
		plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE,
	)
	if err != nil {
		return err
	}
	_, err = plugin_installation.AtomicUninstallPlugin(
		r.tenantId,
		identity,
		r.installationId,
		declaration,
	)
	if err != nil {
		return err
	}

	if err = db.DeleteBy(model.EndPoint{
		PluginID: identity.PluginID(),
		TenantID: r.tenantId,
	}); err != nil {
		return err
	}
	return nil
}
