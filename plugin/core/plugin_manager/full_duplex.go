package plugin_manager

import (
	"fmt"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func FullDuplex(
	r plugin_entities.PluginFullDuplexLifetime,
	launchedChan chan bool,
	errChan chan error,
) {
	// stop plugin when the end of its lifetime
	defer r.Stop()
	// cleanup plugin runtime state and working directory
	defer r.Cleanup()
	// remove lifetime state after plugin if it has been stopped
	defer r.TriggerStop()

	config := r.Configuration()

	utils.Info("new plugin logged in: %s", config.Identity())
	defer func() {
		utils.Info("plugin %s has exited", config.Identity())
	}()

	failedTimes := 0
	once := sync.Once{}

	for !r.Stopped() {
		if failedTimes > 3 {
			once.Do(func() {
				if errChan != nil {
					errChan <- fmt.Errorf("init plugin %s failed", config.Identity())
					close(errChan)
				}
			})

			if launchedChan != nil {
				close(launchedChan)
			}
			return
		}

		utils.Info("plugin %s init", config.Identity())
		if err := r.Init(); err != nil {
			if r.Stopped() {
				break
			}
			utils.Error("init plugin failed: %s", err.Error())
			failedTimes++
			continue
		}
		break
	}

	// notify launched
	once.Do(func() {
		if launchedChan != nil {
			close(launchedChan)
		}

		if errChan != nil {
			close(errChan)
		}
	})

	// init successfully
	for !r.Stopped() {
		if err := r.StartPlugin(); err != nil {
			if r.Stopped() {
				// exit
				break
			}
		}

		c, err := r.Wait()
		if err == nil {
			<-c
		}

		// restart plugin in 5s (skip for debugging runtime)
		if r.Type() != plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE {
			time.Sleep(5 * time.Second)
		}

		// add restart
		r.AddRestarts()
	}
}
