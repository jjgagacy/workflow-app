package serverless_runtime

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"net/url"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/http_requests"
)

func (r *ServerlessPluginRuntime) Listen(sessionId string) (*entities.Broadcast[plugin_entities.SessionMessage], error) {
	l := entities.NewBroadcast[plugin_entities.SessionMessage]()
	r.listeners.Store(sessionId, l)
	return l, nil
}

func (r *ServerlessPluginRuntime) Write(sessionId string, action access_types.PluginAccessAction, data []byte) {
	l, ok := r.listeners.Load(sessionId)
	if !ok {
		utils.Error("session %s not found", sessionId)
		return
	}
	url, err := url.JoinPath(r.LambdaURL, "invoke")
	if err != nil {
		l.Send(plugin_entities.SessionMessage{
			Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
			Data: utils.MarshalJsonBytes(plugin_entities.ErrorResponse{
				ErrorType: "PluginDaemonInnerError",
				Message:   fmt.Sprintf("error creating request: %v", err),
			}),
		})
		l.Close()
		r.Error(fmt.Sprintf("error creating request: %v", err))
		return
	}

	utils.Submit(map[string]string{
		"module":     "serverless_runtime",
		"function":   "Write",
		"session_id": sessionId,
		"lambda_url": r.LambdaURL,
	}, func() {
		defer r.listeners.Delete(sessionId)
		defer l.Close()
		defer l.Send(plugin_entities.SessionMessage{
			Type: plugin_entities.SESSION_MESSAGE_TYPE_END,
			Data: []byte(""),
		})

		// create a new http request to invoke the serverless function
		url += "?action=" + string(action)
		response, err := http_requests.Request(
			r.client, url, "POST",
			http_requests.HttpHeader(map[string]string{
				"Content-Type":            "application/json",
				"Accept":                  "text/event-stream",
				"Monie-Plugin-Session-ID": sessionId,
			}),
			http_requests.HttpPayloadReader(io.NopCloser(bytes.NewReader(data))),
			http_requests.HttpReadTimeout(int64(r.PluginMaxExecutionTimeout*1000)),
		)
		if err != nil {
			l.Send(plugin_entities.SessionMessage{
				Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
				Data: utils.MarshalJsonBytes(plugin_entities.ErrorResponse{
					ErrorType: "PluginDaemonInnerError",
					Message:   fmt.Sprintf("error sending request to serverless: %v", err),
				}),
			})
			r.Error(fmt.Sprintf("error sending request to serverless: %v", err))
			return
		}
		// write to the stream
		scanner := bufio.NewScanner(response.Body)
		defer response.Body.Close()

		scanner.Buffer(make([]byte, 1024), 5*1024*1024)

		sessionAlive := true
		for scanner.Scan() && sessionAlive {
			bytes := scanner.Bytes()

			if len(bytes) == 0 {
				continue
			}

			plugin_entities.ParsePluginUniversalEvent(
				bytes,
				response.Status,
				func(sessionId string, data []byte) {
					sessionMessage, err := utils.UnmarshalJsonBytes[plugin_entities.SessionMessage](data)
					if err != nil {
						l.Send(plugin_entities.SessionMessage{
							Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
							Data: utils.MarshalJsonBytes(plugin_entities.ErrorResponse{
								ErrorType: "PluginDaemonInnerError",
								Message:   fmt.Sprintf("error unmarshaling session message: %v", err),
							}),
						})
						sessionAlive = false
					}
					l.Send(sessionMessage)
				},
				func() {},
				func(err string) {
					l.Send(plugin_entities.SessionMessage{
						Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
						Data: utils.MarshalJsonBytes(plugin_entities.ErrorResponse{
							ErrorType: "PluginDaemonInnerError",
							Message:   fmt.Sprintf("encountered an error: %v", err),
						}),
					})
				},
				func(message string) {},
			)
		}

		if err := scanner.Err(); err != nil {
			l.Send(plugin_entities.SessionMessage{
				Type: plugin_entities.SESSION_MESSAGE_TYPE_ERROR,
				Data: utils.MarshalJsonBytes(plugin_entities.ErrorResponse{
					ErrorType: "PluginDaemonInnerError",
					Message:   fmt.Sprintf("error reading response from serverless: %v", err),
				}),
			})
			r.Error(fmt.Sprintf("error reading response from serverless: %v", err))
		}
	})

}
