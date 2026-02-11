package plugin_manager

import (
	"errors"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (p *PluginManager) InstallLocal(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) (*utils.Stream[PluginInstallResponse], error) {
	exists, err := p.installedBucket.Exists(pluginUniqueIdentifier.FsID())
	if err != nil {
		return nil, err
	}
	if !exists {
		packageFile, err := p.packageBucket.Get(string(pluginUniqueIdentifier))
		if err != nil {
			return nil, err
		}
		err = p.installedBucket.Save(pluginUniqueIdentifier, packageFile)
		if err != nil {
			return nil, err
		}
	}

	runtime, launchedChan, errChan, err := p.launchLocal(pluginUniqueIdentifier)
	if err != nil {
		return nil, err
	}

	response := utils.NewStream[PluginInstallResponse](128)

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InstallLocal",
	}, func() {
		defer response.Close()

		// Check heartbeat every 5 seconds
		ticker := time.NewTicker(time.Second * 5)
		defer ticker.Stop()
		// timeout in 240 seconds
		timer := time.NewTimer(time.Second * 240)
		defer timer.Stop()

		for {
			select {
			case <-ticker.C:
				response.Write(PluginInstallResponse{
					Event: PluginInstallEventInfo,
					Data:  "Installing",
				})
			case <-timer.C:
				response.Write(PluginInstallResponse{
					Event: PluginInstallEventInfo,
					Data:  "Timeout",
				})
				return
			case err := <-errChan:
				if err != nil {
					// Delete the plugin from local and stop the plugin
					identity, er := runtime.Identity()
					if er != nil {
						utils.Error("get plugin identity failed: %s", er.Error())
					}
					if er := p.installedBucket.Delete(identity); er != nil {
						utils.Error("delete plugin from local failed: %s", er.Error())
					}

					var errMsg string
					if er != nil {
						errMsg = errors.Join(err, er).Error()
					} else {
						errMsg = err.Error()
					}

					response.Write(PluginInstallResponse{
						Event: PluginInstallEventError,
						Data:  errMsg,
					})
					runtime.Stop()
					return
				}
			case <-launchedChan:
				response.Write(PluginInstallResponse{
					Event: PluginInstallEventDone,
					Data:  "Installed",
				})
				return
			}
		}
	})
	return response, nil
}
