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

}
