package plugin_manager

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
)

func (p *PluginManager) startLocalWatcher(config *core.Config) {
	go func() {
		p.handleNewLocalPlugins(config)
		for range time.NewTicker(time.Second * 30).C {
			p.handleNewLocalPlugins(config)
			p.removeUninstalledLocalPlugins()
		}
	}()
}

func (p *PluginManager) startRemoteWatcher(config *core.Config) {

}

func (p *PluginManager) handleNewLocalPlugins(config *core.Config) {

}

func (p *PluginManager) removeUninstalledLocalPlugins() {

}
