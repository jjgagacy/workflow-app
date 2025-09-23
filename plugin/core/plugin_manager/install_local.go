package plugin_manager

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (p *PluginManager) InstallLocal(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) (*utils.Stream[PluginInstallResponse], error) {
	runtime, launchedChan, errChan, err := p.launchLocal(pluginUniqueIdentifier)
	if err != nil {
		return nil, err
	}

	response := utils.NewStream[PluginInstallResponse](128)
	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InstallLocal",
	}, func() {

	})
	return response, nil
}
