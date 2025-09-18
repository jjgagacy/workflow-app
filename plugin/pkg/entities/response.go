package entities

type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type GenericResponse[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

func NewSuccessResponse(data any) *Response {
	return &Response{
		Code:    0,
		Message: "success",
		Data:    data,
	}
}

func NewResponse(code int, message string, args ...any) *Response {
	resp := &Response{
		Code:    code,
		Message: message,
		Data:    nil,
	}
	if len(args) > 0 {
		resp.Data = args
	}
	return resp
}
