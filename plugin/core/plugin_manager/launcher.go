package plugin_manager

import (
	"fmt"
	"path"

	"github.com/bytedance/sonic/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type pluginRuntimeWithDecoder struct {
	runtime plugin_entities.PluginRuntime
	decoder decoder.Decoder
}

// extract plugin from package to working directory
func (p *PluginManager) getLocalPluginRuntime(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) (*pluginRuntimeWithDecoder, error) {

	// todo

	identity := ""
	checksum := ""
	pluginWorkingPath := path.Join(p.config.PluginWorkingPath, fmt.Sprintf("%s@%s", identity, checksum))

	return &pluginRuntimeWithDecoder{
		runtime: plugin_entities.PluginRuntime{
			Config: manifest,
			State: plugin_entities.PluginRuntimeState{
				Status:      string(plugin_entities.PLUGIN_RUNTIME_STATUS_PENDING),
				Restarts:    0,
				ActiveAt:    nil,
				Verified:    manifest.Verified,
				WorkingPath: pluginWorkingPath,
			},
		},
	}, nil
}

func (p *PluginManager) launchLocal(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) (plugin_entities.PluginFullDuplexLifetime, <-chan bool, <-chan error, error) {
	panic("")
}
