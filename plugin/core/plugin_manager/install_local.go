package plugin_manager

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (p *PluginManager) InstallLocal(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) (*utils.Stream[PluginInstallResponse], error) {
	panic("")
}
