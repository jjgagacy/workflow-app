package http_requests

import "io"

type HttpOptionType string

type HttpOptions struct {
	Type  HttpOptionType
	Value interface{}
}

const (
	HTTP_OPTION_TYPE_WRITE_TIMEOUT                          HttpOptionType = "write_timeout"
	HTTP_OPTION_TYPE_READ_TIMEOUT                           HttpOptionType = "read_timeout"
	HTTP_OPTION_TYPE_HEADER                                 HttpOptionType = "header"
	HTTP_OPTION_TYPE_PARAMS                                 HttpOptionType = "params"
	HTTP_OPTION_TYPE_PAYLOAD                                HttpOptionType = "payload"
	HTTP_OPTION_TYPE_PAYLOAD_TEXT                           HttpOptionType = "payloadText"
	HTTP_OPTION_TYPE_PAYLOAD_READER                         HttpOptionType = "payloadReader"
	HTTP_OPTION_TYPE_PAYLOAD_JSON                           HttpOptionType = "payloadJson"
	HTTP_OPTION_TYPE_PAYLOAD_MULTIPART                      HttpOptionType = "payloadMultipart"
	HTTP_OPTION_TYPE_RAISE_ERROR_WHEN_STREAM_DATA_NOT_MATCH HttpOptionType = "raiseErrorWhenStreamDataNotMatch"
	HTTP_OPTION_TYPE_DIRECT_REFERER                         HttpOptionType = "directReferer"
	HTTP_OPTION_TYPE_RET_CODE                               HttpOptionType = "retCode"
	HTTP_OPTION_TYPE_USING_LENGTH_PREFIX                    HttpOptionType = "usingLengthPrefix"
)

func HttpWriteTimeout(timeout int64) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_WRITE_TIMEOUT, timeout}
}

func HttpReadTimeout(timeout int64) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_READ_TIMEOUT, timeout}
}

func HttpHeader(header map[string]string) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_HEADER, header}
}

func HttpParams(params map[string]string) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_PARAMS, params}
}

func httpPayload(payload map[string]string) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_PAYLOAD, payload}
}

func httpPayloadReader(payload interface{}) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_PAYLOAD_READER, payload}
}

func HttpPayloadJson(payload interface{}) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_PAYLOAD_JSON, payload}
}

type HttpPayloadMultipartFile struct {
	Filename string
	Reader   io.Reader
}

func HttpPayloadMultipart(payload map[string]string, files map[string]HttpPayloadMultipartFile) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_PAYLOAD_MULTIPART, map[string]interface{}{
		"payload": payload,
		"files":   files,
	}}
}

// For standard SSE protocol, response are split by \n\n
// Which leads a bad performance when decoding, we need a larger chunk to store temporary data
// This option is used to enable length-prefixed mode, which is faster but less memory-friendly
// We uses following format:
//
//	| Field         | Size     | Description                     |
//	|---------------|----------|---------------------------------|
//	| Magic Number  | 1 byte   | Magic number identifier         |
//	| Reserved      | 1 byte   | Reserved field                  |
//	| Header Length | 2 bytes  | Header length (usually 0xa)    |
//	| Data Length   | 4 bytes  | Length of the data              |
//	| Reserved      | 6 bytes  | Reserved fields                 |
//	| Data          | Variable | Actual data content             |
//
//	| Reserved Fields | Header   | Data     |
//	|-----------------|----------|----------|
//	| 4 bytes total   | Variable | Variable |
//
// with the above format, we can achieve a better performance, avoid unexpected memory growth
func HttpUsingLengthPrefixed(using bool) HttpOptions {
	return HttpOptions{HTTP_OPTION_TYPE_USING_LENGTH_PREFIX, using}
}
