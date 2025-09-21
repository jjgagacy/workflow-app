package plugin_manager

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type PluginManager struct {
	m utils.Map[string, plugin_entities.PluginLifetime]
	// configuration
	config *core.Config
	// max launching lock to prevent too many plugins launching at the same time
	maxLaunchingLock chan bool
	// invoke interface
	backwardsInvocation invocation.BackwardsInvocation
	// register plugin
	pluginRegisters []func(lifetime plugin_entities.PluginLifetime) error
	// l is a lock to launch local plugins
	localPluginLaunchingLock *utils.GranularityLock
}

var (
	manager *PluginManager
)

func Manager() *PluginManager {
	return manager
}

func InitGlobalManager(oss oss.OSS, config *core.Config) *PluginManager {
	manager = &PluginManager{
		config:                   config,
		localPluginLaunchingLock: utils.NewGranularityLock(),
		maxLaunchingLock:         make(chan bool, config.PluginLocalLaunchingConcurrent),
	}
	return manager
}

func (p *PluginManager) Get(identity plugin_entities.PluginUniqueIdentifier) (plugin_entities.PluginLifetime, error) {
	if identity.RemoteLike() || p.config.Platform == core.PLATFORM_LOCAL {
		// check if it's a debugging plugin or a local plugin

	} else {
		// otherwise, use serverless runtime instead
	}

	panic("not implemented")
}

func (p *PluginManager) Launch(config *core.Config) {
	invocation, err := invocation.NewInvocationDaemon(
		invocation.InvocationDaemonPayload{
			BaseUrl:      config.InnerApiUrl,
			Key:          config.InnerApiKey,
			WriteTimeout: config.InvocationWriteTimeout,
			ReadTimeout:  config.InvocationReadTimeout,
		},
	)
	if err != nil {
		log.Panicf("Failed to create invocation client: %s", err)
	}
	p.backwardsInvocation = invocation

	// start local watcher
	if config.Platform == core.PLATFORM_LOCAL {
		p.startLocalWatcher(config)
	}

	// start serverless watcher
	if config.Platform == core.PLATFORM_SERVERLESS {
		// todo
	}

	// start remote watcher
	p.startRemoteWatcher(config)
}
