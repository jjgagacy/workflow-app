package http_requests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/parser"
)

func parseJsonBody(resp *http.Response, ret any) error {
	defer resp.Body.Close()
	jsonDecoder := json.NewDecoder(resp.Body)
	return jsonDecoder.Decode(ret)
}

func RequestAndParse[T any](client *http.Client, url string, method string, options ...HttpOption) (*T, error) {
	var ret T

	if _, ok := any(ret).(map[string]any); ok {
		ret = *new(T)
	}

	resp, err := Request(client, url, method, options...)
	if err != nil {
		return nil, err
	}

	readTimeout := int64(60000) // 60 seconds
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

func RequestAndParseStream[T any](client *http.Client, url string, method string, options ...HttpOption) (
	*utils.Stream[T], error,
) {
	resp, err := Request(client, url, method, options...)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		defer resp.Body.Close()
		errMsg, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("request failed with status code: %d and response with: %s", resp.StatusCode, errMsg)
	}

	ch := utils.NewStream[T](1024)

	// get read timeout
	readTimeout := int64(60000)
	raiseErrorWhenStreamDataNotMatch := false
	usingLengthPrefixed := false
	for _, option := range options {
		switch option.Type {
		case HTTP_OPTION_TYPE_READ_TIMEOUT:
			readTimeout = option.Value.(int64)
		case HTTP_OPTION_TYPE_RAISE_ERROR_WHEN_STREAM_DATA_NOT_MATCH:
			raiseErrorWhenStreamDataNotMatch = option.Value.(bool)
		case HTTP_OPTION_TYPE_USING_LENGTH_PREFIX:
			usingLengthPrefixed = option.Value.(bool)
		}
	}
	time.AfterFunc(time.Millisecond*time.Duration(readTimeout), func() {
		resp.Body.Close()
	})

	processData := func(data []byte) error {
		t, err := utils.UnmarshalJsonBytes[T](data)
		if err != nil {
			if raiseErrorWhenStreamDataNotMatch {
				return err
			} else {
				utils.Warn("stream data not match for %s, got %s", url, string(data))
				return fmt.Errorf("tream data not match for %s, got %s", url, string(data))
			}
		}

		ch.Write(t)
		return nil
	}

	utils.Submit(map[string]string{
		"module":   "http_requests",
		"function": "RequestAndParseStream",
	}, func() {
		defer resp.Body.Close()

		var err error
		if usingLengthPrefixed {
			err = parser.LengthPrefixedChunking(resp.Body, 0x7f, 1024*1024*30, processData) // 30MB limit
		} else {
			err = parser.LineBasedChunking(resp.Body, 1024*1024*30, func(data []byte) error { // 30MB limit
				if len(data) == 0 {
					return nil
				}
				if bytes.HasPrefix(data, []byte("data:")) {
					data = data[5:]
				}
				if bytes.HasPrefix(data, []byte("event:")) {
					return nil
				}
				data = bytes.TrimSpace(data)
				return processData(data)
			})
		}
		if err != nil {
			ch.WriteError(err)
		}
	})

	return ch, nil
}
