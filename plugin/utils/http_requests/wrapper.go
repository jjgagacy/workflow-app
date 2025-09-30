package http_requests

import (
	"encoding/json"
	"net/http"
	"time"
)

func parseJsonBody(resp *http.Response, ret interface{}) error {
	defer resp.Body.Close()
	jsonDecoder := json.NewDecoder(resp.Body)
	return jsonDecoder.Decode(ret)
}

func RequestAndParse[T any](client *http.Client, url string, method string, options ...HttpOptions) (*T, error) {
	var ret T

	if _, ok := any(ret).(map[string]any); ok {
		ret = *new(T)
	}

	resp, err := Request(client, url, method, options...)
	if err != nil {
		return nil, err
	}

	readTimeout := int64(60000)
	for _, option := range options {
		if option.Type == HTTP_OPTION_TYPE_READ_TIMEOUT {
			readTimeout = option.Value.(int64)
			break
		}
	}
	time.AfterFunc(time.Millisecond*time.Duration(readTimeout), func() {
		resp.Body.Close()
	})

	err = parseJsonBody(resp, &ret)
	if err != nil {
		return nil, err
	}

	return &ret, nil
}
