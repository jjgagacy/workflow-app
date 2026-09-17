package debugging_runtime

import (
	"encoding/json"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types/exception"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/panjf2000/gnet/v2"
)

func (r *RemotePluginRuntime) Listen(sessionId string) (*entities.Broadcast[plugin_entities.SessionMessage], error) {
	listener := entities.NewBroadcast[plugin_entities.SessionMessage]()
	listener.OnClose(func() {
		utils.Submit(map[string]string{
			"module": "debugging_runtime",
			"method": "removeMessageCallbackHandler",
		}, func() {
			r.removeMessageCallbackHandler(sessionId)
			r.removeSessionMessageCloser(sessionId)
		})
	})
	r.addSessionMessageCloser(sessionId, func() {
		listener.Send(plugin_entities.SessionMessage{
			Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
			Data: json.RawMessage(utils.MarshalJson(plugin_entities.ErrorResponse{
				ErrorType: exception.PluginConnectionClosedError,
				Message:   "Connection closed unexpectedly",
				Args:      map[string]any{},
			})),
		})
	})
	r.addMessageCallbackHandler(sessionId, func(data []byte) {
		chunk, err := utils.UnmarshalJsonBytes[plugin_entities.SessionMessage](data)
		if err != nil {
			utils.Error("unmarshal session message json failed: %s\n", err)
			return
		}

		listener.Send(chunk)
	})
	return listener, nil
}

func (r *RemotePluginRuntime) Write(sessionId string, action access_types.PluginAccessAction, data []byte) {
	r.conn.AsyncWrite(append(data, '\n'), func(c gnet.Conn, err error) error {
		return nil
	})
}
