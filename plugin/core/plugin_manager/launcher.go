package plugin_manager

import (
	"errors"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/local_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type pluginRuntimeWithDecoder struct {
	runtime plugin_entities.PluginRuntime
	decoder decoder.PluginDecoder
}

// extract plugin from package to working directory
func (p *PluginManager) getLocalPluginRuntime(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) (*pluginRuntimeWithDecoder, error) {
	pluginZip, err := p.installedBucket.Get(pluginUniqueIdentifier)
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("get plugin package zip error"))
	}
	decoder, err := decoder.NewZipPluginDecoder(pluginZip)
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("create plugin zip decoder error"))
	}
	manifest, err := decoder.Manifest()
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("get plugin manifest error"))
	}
	checksum, err := decoder.Checksum()
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("checksum error"))
	}

	identity := manifest.Identity()
	identity = strings.ReplaceAll(identity, ":", "-")
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
	plugin, err := p.getLocalPluginRuntime(pluginUniqueIdentifier)
	if err != nil {
		return nil, nil, nil, err
	}

	fmt.Println("------", plugin.decoder) // TODO: nil
	identity, err := plugin.decoder.UniqueIdentity()
	if err != nil {
		return nil, nil, nil, err
	}

	// lock launch process
	p.localPluginLaunchingLock.Lock(identity.String())
	defer p.localPluginLaunchingLock.Unlock(identity.String())

	// check if the plugin is alrady running
	if lifetime, ok := p.m.Load(identity.String()); ok {
		lifetime, ok := lifetime.(plugin_entities.PluginFullDuplexLifetime)
		if !ok {
			return nil, nil, nil, fmt.Errorf("plugin runtime not found")
		}

		// returns a closed channel indicates the plugin is already running
		c := make(chan bool)
		close(c)
		errChan := make(chan error)
		close(errChan)

		return lifetime, c, errChan, nil
	}

	// extract plugin
	decoder, ok := plugin.decoder.(*decoder.ZipPluginDecoder)
	if !ok {
		return nil, nil, nil, fmt.Errorf("plugin decoder is not a zip decoder")
	}

	if _, err := os.Stat(plugin.runtime.State.WorkingPath); err != nil {
		if err := decoder.ExtractTo(plugin.runtime.State.WorkingPath); err != nil {
			return nil, nil, nil, errors.Join(err, fmt.Errorf("extract plugin to working directory error"))
		}
	}

	success := false
	failed := func(message string) error {
		if !success {
			os.RemoveAll(plugin.runtime.State.WorkingPath)
		}
		return errors.New(message)
	}

	assets, err := plugin.decoder.Assets()
	if err != nil {
		return nil, nil, nil, failed(err.Error())
	}

	localPluginRuntime := local_runtime.NewLocalPluginRuntime(local_runtime.LocalPluginRuntimeConfig{
		HttpProxy:              p.config.HttpProxy,
		HttpsProxy:             p.config.HttpsProxy,
		NoProxy:                p.config.NoProxy,
		StdoutBufferSize:       p.config.PluginStdioBufferSize,
		StdoutMaxBufferSize:    p.config.PluginStdioMaxBufferSize,
		PythonInterpreterPath:  p.config.PythonInterpreterPath,
		UvPath:                 p.config.UvPath,
		PythonEnvInitTimeout:   p.config.PythonEnvInitTimeout,
		PythonCompileExtraArgs: p.config.PythonCompileExtraArgs,
	})
	localPluginRuntime.PluginRuntime = plugin.runtime
	localPluginRuntime.BasicChecksum = basic_runtime.BasicChecksum{
		MediaTransport: basic_runtime.NewMediaTransport(p.mediaBucket),
		WorkingPath:    plugin.runtime.State.WorkingPath,
		Decoder:        plugin.decoder,
	}

	if err := localPluginRuntime.RemapAssets(
		&localPluginRuntime.Config,
		assets,
	); err != nil {
		return nil, nil, nil, failed(errors.Join(err, fmt.Errorf("remap plugin assets error")).Error())
	}

	success = true

	p.m.Store(identity.String(), localPluginRuntime)

	launchedChan := make(chan bool)
	errChan := make(chan error)

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "LaunchLocal",
	}, func() {
		defer func() {
			if r := recover(); r != nil {
				utils.Error("plugin runtime panic: %v", r)
			}
			p.m.Delete(identity.String())
		}()

		// Add max launching lock to prevent too many plugins lauching at the same time
		p.maxLaunchingLock <- true
		utils.Submit(map[string]string{
			"module":   "plugin_manager",
			"function": "LaunchLocal",
		}, func() {
			// wait for plugin launched
			<-launchedChan
			// release max launching lock
			<-p.maxLaunchingLock
		})

		p.fullDuplexLifecycle(localPluginRuntime, launchedChan, errChan)
	})

	return localPluginRuntime, launchedChan, errChan, nil
}

func (p *PluginManager) fullDuplexLifecycle(
	r plugin_entities.PluginFullDuplexLifetime,
	launchedChan chan bool,
	errChan chan error,
) {
	for _, reg := range p.pluginRegisters {
		err := reg(r)
		if err != nil {
			utils.Error("add plugin to cluster failed: %s", err.Error())
			return
		}
	}

	FullDuplex(r, launchedChan, errChan)
}
