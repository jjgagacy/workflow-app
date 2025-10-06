package plugin_daemon

import (
	"encoding/hex"
	"net/http"
	"sync/atomic"

	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeEndPoint(
	session *session_manager.Session,
	request *requests.RequestInvokeEndPoint,
) (int, *http.Header, *utils.Stream[[]byte], error) {
	resp, err := GenericInvokePlugin[requests.RequestInvokeEndPoint, endpoint_entities.EndpointResponseChunk](
		session,
		request,
		128,
	)
	if err != nil {
		return http.StatusInternalServerError, nil, nil, err
	}

	statusCode := int32(http.StatusContinue)
	headers := &http.Header{}
	response := utils.NewStream[[]byte](128)
	response.OnClose(func() {
		resp.Close()
	})

	// 启动单独的 goroutine 处理响应流
	utils.Submit(map[string]string{
		"module":   "plugin_daemon",
		"function": "InvokeEndPoint",
		"type":     "stream_processing",
	}, func() {
		defer response.Close()

		for resp.Next() {
			chunk, err := resp.Read()
			if err != nil {
				response.WriteError(err)
				return
			}

			// 处理状态码（只在第一个块中）
			if chunk.Status != nil {
				atomic.StoreInt32(&statusCode, int32(*chunk.Status))
			}

			// 处理头部（只在第一个块中）
			if chunk.Headers != nil {
				for k, v := range chunk.Headers {
					headers.Add(k, v)
				}
			}

			// 处理响应体
			if chunk.Result != nil {
				dec, err := hex.DecodeString(*chunk.Result)
				if err != nil {
					response.WriteError(err)
					return
				}
				response.Write(dec)
			}
		}
	})

	return int(statusCode), headers, response, nil
}
