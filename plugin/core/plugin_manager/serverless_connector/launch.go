package serverless_connector

import (
	"bytes"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	SERVERLESS_LAUNCH_LOCK_PREFIX = "serverless_launch_lock_"
)

// LaunchPlugin uploads the plugin to specified serverless environment
// returns the function url and name
func LaunchPlugin(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	originPackage []byte,
	decoder decoder.PluginDecoder,
	timeout int, // in seconds
	ignoreIdempotent bool, // if true, never check if the plugin has launched
) (*utils.Stream[LaunchFunctionResponse], error) {
	checksum, err := decoder.Checksum()
	if err != nil {
		return nil, err
	}
	if err := cache.Lock(SERVERLESS_LAUNCH_LOCK_PREFIX+checksum, "1", 300*time.Second, 300*time.Second); err != nil {
		return nil, err
	}
	defer cache.Unlock(SERVERLESS_LAUNCH_LOCK_PREFIX+checksum, "1")

	manifest, err := decoder.Manifest()
	if err != nil {
		return nil, err
	}

	if !ignoreIdempotent {
		// Check if the plugin has already been launched
		function, err := FetchFunction(manifest, checksum)
		if err != nil {
			if err != ErrFunctionNotFound {
				return nil, err
			}
		} else {
			// the function has already been launched, return its details
			response := &utils.Stream[LaunchFunctionResponse]{}
			response.Write(LaunchFunctionResponse{
				Event:   FunctionURL,
				Message: function.FunctionURL,
			})
			response.Write(LaunchFunctionResponse{
				Event:   Function,
				Message: function.FunctionName,
			})
			response.Write(LaunchFunctionResponse{
				Event:   Done,
				Message: "",
			})
			response.Close()
			return response, nil
		}
	}

	response, err := SetupFunction(pluginUniqueIdentifier, manifest, checksum, bytes.NewReader(originPackage), timeout)
	if err != nil {
		return nil, err
	}
	return response, nil
}
