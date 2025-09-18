package entities

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type genericError struct {
	Message   string         `json:"message"`
	ErrorType string         `json:"error_type"`
	Args      map[string]any `json:"args"`

	code int
}

func (e *genericError) Error() string {
	return e.Message
}

func (e *genericError) ToResponse() *Response {
	errors := utils.MarshalJson(e)
	return NewResponse(e.code, errors)
}

func NewError(code int, message string, args map[string]any) PluginError {
	return &genericError{
		code:      code,
		Message:   message,
		ErrorType: "",
		Args:      args,
	}
}

func NewErrorWithType(code int, message string, errorType string) PluginError {
	return &genericError{
		code:      code,
		Message:   message,
		ErrorType: errorType,
	}
}

func NewErrorWithTypeAndArgs(code int, message string, errorType string, args map[string]any) PluginError {
	return &genericError{
		code:      code,
		Message:   message,
		ErrorType: errorType,
		Args:      args,
	}
}

func NewErrorMessage(message string) PluginError {
	return &genericError{
		code:    -1,
		Message: message,
	}
}

func NewErrorMessagef(format string, args ...any) PluginError {
	return &genericError{
		code:    -1,
		Message: fmt.Sprintf(format, args...),
	}
}
