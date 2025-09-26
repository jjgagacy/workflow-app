package plugin_manager

import (
	"errors"
	"fmt"
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/media_transport"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
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
	// mediaBucket is used to manage media files like plugin icons, images, etc.
	mediaBucket *media_transport.MediaBucket
	// packageBucket is used to mange plugin packages, all the packages uploaded by users will be saved here
	packageBucket *media_transport.PackageBucket
	// installedBucket is used manage installed plugins
	installedBucket *media_transport.InstalledBucket
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
		mediaBucket: media_transport.NewMediaBucket(
			oss,
			config.PluginMediaCachePath,
			config.PluginMediaCacheSize,
		),
		packageBucket: media_transport.NewPackageBucket(
			oss,
			config.PluginPackageCachePath,
		),
		installedBucket: media_transport.NewInstalledBucket(
			oss,
			config.PluginInstalledPath,
		),
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

func (p *PluginManager) SavePackage(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	pkgData []byte,
	thirdPartySignatureVerificationConfig *decoder.ThirdPartySignatureVerificationConfig,
) (*plugin_entities.PluginDeclaration, error) {
	zipDecoder, err := decoder.NewZipPluginDecoder(pkgData)
	if err != nil {
		return nil, err
	}

	declaration, err := zipDecoder.Manifest()
	if err != nil {
		return nil, err
	}

	assets, err := zipDecoder.Assets()
	if err != nil {
		return nil, err
	}

	_, err = p.mediaBucket.RemapAssets(&declaration, assets)
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("failed to remap assets"))
	}

	uniqueIdentifier, err := zipDecoder.UniqueIdentity()
	if err != nil {
		return nil, err
	}

	err = p.packageBucket.Save(string(pluginUniqueIdentifier), pkgData)
	if err != nil {
		return nil, err
	}

	if _, err := db.GetOne[model.PluginDeclaration](
		db.Equal("plugin_unique_identifier", uniqueIdentifier.String()),
	); err == types.ErrRecordNotFound {
		err = db.Create(&model.PluginDeclaration{
			PluginUniqueIdentifier: string(uniqueIdentifier),
			PluginID:               uniqueIdentifier.PluginID(),
			Declaration:            declaration,
		})
		if err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return &declaration, nil
}
