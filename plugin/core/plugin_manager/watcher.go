package plugin_manager

import (
	"runtime/debug"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/debugging_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/local_runtime"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (p *PluginManager) startLocalWatcher(config *core.Config) {
	go func() {
		utils.Info("start to handle new plugin in path: %s", p.config.PluginInstalledPath)
		utils.Info("Launching plugin with max concurrency: %d", p.config.PluginLocalLaunchingConcurrent)
		p.handleNewLocalPlugins(config)
		for range time.NewTicker(time.Second * 30).C {
			p.handleNewLocalPlugins(config)
			p.removeUninstalledLocalPlugins()
		}
	}()
}

func (p *PluginManager) initRemoteWatcher(config *core.Config) {
	if p.remotePluginServer != nil {
		return
	}
	p.remotePluginServer = debugging_runtime.NewRemotePluginServer(config, p.mediaBucket)
}

func (p *PluginManager) startRemoteWatcher(config *core.Config) {
	if !(config.PluginRemoteInstallingEnabled != nil && *config.PluginRemoteInstallingEnabled) {
		return
	}

	p.initRemoteWatcher(config)
	go func() {
		err := p.remotePluginServer.Launch()
		if err != nil {
			utils.Error("launch remote plugin server failed: %s", err.Error())
		}
	}()
	go func() {
		p.remotePluginServer.Wrap(func(runtime plugin_entities.PluginFullDuplexLifetime) {
			identity, err := runtime.Identity()
			if err != nil {
				utils.Error("get remote plugin identity failed: %s", err.Error())
				return
			}
			p.m.Store(identity.String(), runtime)
			utils.Submit(map[string]string{
				"module":    "plugin_manager",
				"function":  "startRemoteWatcher",
				"plugin_id": identity.String(),
				"type":      "remote",
			}, func() {
				defer func() {
					if err := recover(); err != nil {
						utils.Error("panic recovered: %v, stack: %s", err, debug.Stack())
					}
					p.m.Delete(identity.String())
				}()
				p.fullDuplexLifecycle(runtime, nil, nil)
			})
			utils.Info("remote plugin connected: %s", identity.String())
		})
	}()
}

func (p *PluginManager) handleNewLocalPlugins(config *core.Config) {
	// walk through all plugins
	plugins, err := p.installedBucket.List()
	if err != nil {
		utils.Error("list installed plugin failed: %s", err.Error())
		return
	}

	var wg sync.WaitGroup
	maxConcurrency := config.PluginLocalLaunchingConcurrent
	// 计数信号量（Counting Semaphore）
	sem := make(chan struct{}, maxConcurrency)

	for _, plugin := range plugins {
		_, exist := p.m.Load(plugin.String())
		if exist {
			continue
		}

		wg.Add(1)
		currentPlugin := plugin
		utils.Submit(map[string]string{
			"module":   "plugin_manager",
			"function": "handleNewLocalPlugins",
		}, func() {
			sem <- struct{}{}
			defer func() {
				if err := recover(); err != nil {
					utils.Error("plugin launch runtime error: %v, stack: %s", err, debug.Stack())
				}
				<-sem
				wg.Done()
			}()

			runtime, launchedChan, errChan, err := p.launchLocal(currentPlugin)
			if err != nil {
				utils.Error("launch local plugin failed: %s", err.Error())
				return
			}

			if errChan != nil {
				for err := range errChan {
					utils.Error("plugin launch error: %s", err.Error())
				}
			}

			if _, err := db.GetOne[model.PluginDeclaration](
				db.Equal("plugin_unique_identifier", currentPlugin.String()),
			); err == types.ErrRecordNotFound {
				err = db.Create(&model.PluginDeclaration{
					PluginUniqueIdentifier: currentPlugin.String(),
					PluginID:               currentPlugin.PluginID(),
					Declaration:            *runtime.Configuration(),
				})
				if err != nil {
					utils.Error("create plugin declaration error: %s", err.Error())
				}
			}

			// Wait for plugin to complete setup
			if launchedChan != nil {
				<-launchedChan
			}
		})
	}

	wg.Wait()
}

func (p *PluginManager) removeUninstalledLocalPlugins() {
	p.m.Range(func(key string, value plugin_entities.PluginLifetime) bool {
		// try to convert to local runtime
		runtime, ok := value.(*local_runtime.LocalPluginRuntime)
		if !ok {
			return true
		}
		_, err := runtime.Identity()
		if err != nil {
			utils.Error("get plugin identity failed: %s", err.Error())
			return true
		}
		entity := runtime.Config.FsID()
		// check if plugin is deleted, stop it if so
		exists, err := p.installedBucket.Exists(entity)
		if err != nil {
			utils.Error("check plugin existent failed: %s", err.Error())
			return true
		}
		if !exists {
			runtime.Stop()
		}
		return true
	})
}
