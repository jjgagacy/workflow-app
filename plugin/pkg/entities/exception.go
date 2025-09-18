package entities

const (
	// Common Errors
	ErrBadRequest              = "ErrMsgBadRequest"
	ErrNotFound                = "ErrMsgNotFound"
	ErrInternal                = "ErrMsgInternal"
	ErrUniqueIdentifierInvalid = "ErrMsgUniqueIdentifierInvalid"
	ErrUnauthorizedInvalid     = "ErrUnauthorizedInvalid"
)

type PluginError interface {
	error

	ToResponse() *Response
}

func InternalError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(-500, err.Error(), ErrInternal)
}

func BadRequestError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(-400, err.Error(), ErrBadRequest)
}

func NotFoundError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(-404, err.Error(), ErrNotFound)
}

func UniqueIdentifierInvalidError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(-400, err.Error(), ErrUniqueIdentifierInvalid)
}

func UnauthorizedError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(-401, err.Error(), ErrUnauthorizedInvalid)
}
