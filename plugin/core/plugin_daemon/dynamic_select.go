package plugin_daemon

import (
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/dynamic_select_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func FetchDynamicParameterOptions(
	session *session_manager.Session,
	req *requests.RequestDynamicParameterSelect,
) (
	*utils.Stream[dynamic_select_entities.DynamicSelectResult], error,
) {
	return GenericInvokePlugin[requests.RequestDynamicParameterSelect, dynamic_select_entities.DynamicSelectResult](
		session,
		req,
		1,
	)
}
