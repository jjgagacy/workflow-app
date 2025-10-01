package plugin_daemon

import (
	"errors"
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/backwards_invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/backwards_invocation/transaction"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/generic_invoke"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func GenericInvokePlugin[T any, R any](
	session *session_manager.Session,
	req *T,
	responseBufferSize int,
) (
	*utils.Stream[R], error,
) {
	runtime := session.Runtime()
	if runtime == nil {
		return nil, errors.New("plugin runtime not found")
	}

	response := utils.NewStream[R](responseBufferSize)
	listener := runtime.Listen(session.ID)
	listener.Listen(func(chunk plugin_entities.SessionMessage) {
		switch chunk.Type {
		case plugin_entities.SESSION_MESSAGE_TYPE_STREAM:
		case plugin_entities.SESSION_MESSAGE_TYPE_INVOKE:
			if runtime.Type() == plugin_entities.PLUGIN_RUNTIME_TYPE_SERVERLESS {
				// todo
			}
			if err := backwards_invocation.Invoke(
				runtime.Configuration(),
				session.AccessType,
				session,
				transaction.NewFullDuplexEventWriter(session),
				chunk.Data,
			); err != nil {
				response.WriteError(errors.New(utils.MarshalJson(map[string]string{
					"error_type": "invoke_error",
					"message":    fmt.Sprintf("invoke failed: %s", err.Error()),
				})))
				response.Close()
				return
			}
		case plugin_entities.SESSION_MESSAGE_TYPE_END:
		case plugin_entities.SESSION_MESSAGE_TYPE_ERROR:
		}
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
