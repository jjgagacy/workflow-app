package plugin_manager

import "github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"

func (p *PluginManager) UninstallFromLocal(identity plugin_entities.PluginUniqueIdentifier) error {
	if err := p.installedBucket.Delete(identity); err != nil {
		return err
	}
	runtime, ok := p.m.Load(string(identity))
	if !ok {
		return nil
	}
	runtime.Stop()
	return nil
}
