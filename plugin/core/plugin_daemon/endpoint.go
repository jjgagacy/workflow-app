package plugin_daemon

import (
	"net/http"

	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeEndPoint(
	session *session_manager.Session,
	request *requests.RequestInvokeEndPoint,
) (
	int, *http.Header, *utils.Stream[[]byte], error,
) {
	resp, err := GenericInvokePlugin[requests.RequestInvokeEndPoint, endpoint_entities.EndpointResponseChunk](
		session,
		request,
		128,
	)
	panic("")
}
