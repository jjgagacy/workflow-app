package plugin_daemon

import (
	"errors"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/generic_invoke"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func GenericInvokePlugin[T any, R any](
	session *session_manager.Session,
	req *T,
	responseBufferSie int,
) (
	*utils.Stream[R], error,
) {
	runtime := session.Runtime()
	if runtime == nil {
		return nil, errors.New("plugin runtime not found")
	}

	response := utils.NewStream[R](responseBufferSie)
	listener := runtime.Listen(session.ID)
	listener.Listen(func(chunk plugin_entities.SessionMessage) {

	})

	response.OnClose(func() {
		listener.Close()
	})

	session.Write(
		session_manager.EVENT_STREAM_REQUEST,
		session.AccessAction,
		generic_invoke.GetInvokePluginMap(
			session,
			req,
		),
	)

	return response, nil
}
