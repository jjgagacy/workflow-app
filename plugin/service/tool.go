package service

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeTool(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTool],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[tool_entities.ToolResponseChunk], error) {
			return plugin_daemon.InvokeTool(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_TOOL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_TOOL,
		req,
		ctx,
		maxTimeout,
	)
}

func ValidateToolCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateToolCredentials],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[tool_entities.ValidateCredentialResult], error) {
			return plugin_daemon.ValidateToolCredentials(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_TOOL,
		access_types.PLUGIN_ACCESS_ACTION_VALIDATE_TOOL_CREDENTIALS,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeGetToolRuntimeParameters(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetToolRuntimeParameters],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[tool_entities.GetToolRuntimeParametersResponse], error) {
			return plugin_daemon.GetToolRuntimeParametersResponse(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_TOOL,
		access_types.PLUGIN_ACCESS_ACTION_VALIDATE_TOOL_CREDENTIALS,
		req,
		ctx,
		maxTimeout,
	)
}
