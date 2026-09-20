package serverless_runtime

import (
	"net/http"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/basic_runtime"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type ServerlessPluginRuntime struct {
	basic_runtime.BasicChecksum
	plugin_entities.PluginRuntime

	// access url for lambda function
	LambdaURL  string
	LambdaName string

	// listeners mapping session id to the listener
	listeners utils.Map[string, *entities.Broadcast[plugin_entities.SessionMessage]]

	client *http.Client

	PluginMaxExecutionTimeout int // in seconds
}
