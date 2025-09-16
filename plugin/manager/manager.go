package manager

import (
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/oss"
)

type PluginManager struct {
	config *core.Config
}

var (
	manager *PluginManager
)

func InitGlobalManager(oss oss.OSS, config *core.Config) *PluginManager {
	manager = &PluginManager{
		config: config,
	}

	return manager
}

func Manager() *PluginManager {
	return manager
}

func (p *PluginManager) Launch(config *core.Config) {

}
