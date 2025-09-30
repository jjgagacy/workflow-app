package plugin_daemon

import (
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeLLM(
	session *session_manager.Session,
	req *requests.RequestInvokeLLM,
) (
	*utils.Stream[model_entities.LLMResultChunk], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeLLM, model_entities.LLMResultChunk](
		session,
		req,
		512,
	)
}
