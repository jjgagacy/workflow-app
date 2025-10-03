package plugin_daemon

import (
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeTool(
	session *session_manager.Session,
	request *requests.RequestInvokeTool,
) (
	*utils.Stream[tool_entities.ToolResponseChunk], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeTool, tool_entities.ToolResponseChunk](
		session,
		request,
		1,
	)
}

func ValidateToolCredentials(
	session *session_manager.Session,
	request *requests.RequestValidateToolCredentials,
) (
	*utils.Stream[tool_entities.ValidateCredentialResult], error,
) {
	return GenericInvokePlugin[requests.RequestValidateToolCredentials, tool_entities.ValidateCredentialResult](
		session,
		request,
		1,
	)
}

func GetToolRuntimeParametersResponse(
	session *session_manager.Session,
	request *requests.RequestGetToolRuntimeParameters,
) (
	*utils.Stream[tool_entities.GetToolRuntimeParametersResponse], error,
) {
	return GenericInvokePlugin[requests.RequestGetToolRuntimeParameters, tool_entities.GetToolRuntimeParametersResponse](
		session,
		request,
		1,
	)
}
