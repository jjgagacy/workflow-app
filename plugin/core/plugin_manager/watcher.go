package plugin_manager

import (
	"runtime/debug"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/local_runtime"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
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

func (p *PluginManager) startRemoteWatcher(config *core.Config) {
	// todo
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

			_, launchedChan, errChan, err := p.launchLocal(currentPlugin)
			if err != nil {
				utils.Error("launch local plugin failed: %s", err.Error())
				return
			}

			if errChan != nil {
				for err := range errChan {
					utils.Error("plugin launch error: %s", err.Error())
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
		pluginUniqueIdentifier, err := runtime.Identity()
		if err != nil {
			utils.Error("get plugin identity failed: %s", err.Error())
			return true
		}
		// check if plugin is deleted, stop it if so
		exists, err := p.installedBucket.Exists(pluginUniqueIdentifier)
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
