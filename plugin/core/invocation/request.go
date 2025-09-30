package invocation

import (
	"fmt"
	"reflect"

	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/http_requests"
)

// Request sends a request to inner api and validate the response
func Request[T any](i *RequestBackwardsInvocation, method string, path string, options ...http_requests.HttpOptions) (*T, error) {
	options = append(options,
		http_requests.HttpHeader(map[string]string{
			"X-Api-Key": i.ApiKey,
		}),
		http_requests.HttpWriteTimeout(i.writeTimeout),
		http_requests.HttpReadTimeout(i.readTimeout),
	)

	req, err := http_requests.RequestAndParse[BackwardsInvocationResponse[T]](i.client, i.ApiBaseUrl.JoinPath(path).String(), method, options...)
	if err != nil {
		return nil, err
	}

	if req.Error != "" {
		return nil, fmt.Errorf("request failed: %s", req.Error)
	}

	if req.Data == nil {
		return nil, fmt.Errorf("data is nil")
	}

	if reflect.TypeOf(*req.Data).Kind() == reflect.Map {
		return req.Data, nil
	}

	if err := validators.EntitiesValidator.Struct(req.Data); err != nil {
		return nil, fmt.Errorf("validate request failed: %s", err.Error())
	}

	return req.Data, nil
}

func StreamResponse[T any](i *RequestBackwardsInvocation, method string, path string, options ...http_requests.HttpOptions) (
	*utils.Stream[T], error,
) {
	options = append(options,
		http_requests.HttpHeader(map[string]string{
			"X-Api-Key": i.ApiKey,
		}),
		http_requests.HttpWriteTimeout(i.writeTimeout),
		http_requests.HttpReadTimeout(i.readTimeout),
		http_requests.HttpUsingLengthPrefixed(false), // todo true
	)

	response, err := http_requests.RequestAndParseStream[BackwardsInvocationResponse[T]](
		i.client,
		i.ApiBaseUrl.JoinPath(path).String(),
		method,
		options...,
	)
	if err != nil {
		return nil, err
	}

	streamResponse := utils.NewStream[T](1024)
	streamResponse.OnClose(func() {
		response.Close()
	})

	utils.Submit(map[string]string{
		"module":   "invocation",
		"function": "StreamResponse",
	}, func() {
		defer streamResponse.Close()

		for response.Next() {
			t, err := response.Read()
			if err != nil {
				streamResponse.WriteError(err)
				break
			}
			if t.Error != "" {
				streamResponse.WriteError(fmt.Errorf("request failed: %s", t.Error))
				break
			}
			if t.Data == nil {
				streamResponse.WriteError(fmt.Errorf("data is nil"))
				break
			}
			// skip validation for map[string]any
			if reflect.TypeOf(*t.Data).Kind() != reflect.Map {
				if err := validators.EntitiesValidator.Struct(t.Data); err != nil {
					streamResponse.WriteError(fmt.Errorf("validate request failed: %s", err.Error()))
					break
				}
			}

			streamResponse.Write(*t.Data)
		}
	})

	return streamResponse, nil
}
