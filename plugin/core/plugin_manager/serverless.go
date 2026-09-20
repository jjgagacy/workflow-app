package plugin_manager

import (
	"fmt"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/serverless_runtime"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
)

const (
	PLUGIN_SERVERLESS_CACHE_KEY = "serverless:runtime:%s"
)

func (p *PluginManager) getServerlessCacheKey(
	identity plugin_entities.PluginUniqueIdentifier,
) string {
	return fmt.Sprintf(PLUGIN_SERVERLESS_CACHE_KEY, identity.String())
}

func (p *PluginManager) getServerlessRuntime(
	identity plugin_entities.PluginUniqueIdentifier,
) (plugin_entities.PluginLifetime, error) {
	model, err := p.getServerlessRuntimeModel(identity)
	if err != nil {
		return nil, err
	}
	declaration, err := cache.CombinedGetPluginDeclaration(identity, plugin_entities.PLUGIN_RUNTIME_TYPE_SERVERLESS)
	if err != nil {
		return nil, err
	}

	runtimeEntity := plugin_entities.PluginRuntime{
		Config: *declaration,
	}
	runtimeEntity.InitState()

	pluginRuntime := serverless_runtime.ServerlessPluginRuntime{
		BasicChecksum: basic_runtime.BasicChecksum{
			MediaTransport: basic_runtime.NewMediaTransport(p.mediaBucket),
			ChecksumValue:  model.Checksum,
		},
		PluginRuntime:             runtimeEntity,
		LambdaURL:                 model.FunctionURL,
		LambdaName:                model.FunctionName,
		PluginMaxExecutionTimeout: p.config.PluginMaxExecutionTimeout,
	}

	if err := pluginRuntime.InitEnvironment(); err != nil {
		return nil, err
	}

	return &pluginRuntime, nil
}

func (p *PluginManager) getServerlessRuntimeModel(
	identity plugin_entities.PluginUniqueIdentifier,
) (*model.ServerlessRuntime, error) {
	runtime, err := cache.Get[model.ServerlessRuntime](
		p.getServerlessCacheKey(identity),
	)
	if err != nil && err != cache.ErrNotFound {
		return nil, fmt.Errorf("unexpected error occurred during fetch serverless runtime cache: %v", err)
	}
	if err == cache.ErrNotFound {
		runtimeModel, err := db.GetOne[model.ServerlessRuntime](
			db.Equal("plugin_unique_identifier", identity.String()),
		)
		if err == types.ErrRecordNotFound {
			return nil, fmt.Errorf("plugin serverless runtime not found: %s", identity.String())
		}
		if err != nil {
			return nil, fmt.Errorf("unexpected error occurred during fetch serverless runtime from DB: %v", err)
		}
		_ = cache.Store(
			p.getServerlessCacheKey(identity),
			runtimeModel,
			time.Minute*30,
		)
		runtime = &runtimeModel
	} else if err != nil {
		return nil, fmt.Errorf("unexpected error occurred during fetch serverless runtime cache: %v", err)
	}
	return runtime, nil
}

func (p *PluginManager) clearServerlessRuntimeCache(
	identity plugin_entities.PluginUniqueIdentifier,
) error {
	_, err := cache.Del(p.getServerlessCacheKey(identity))
	return err
}
