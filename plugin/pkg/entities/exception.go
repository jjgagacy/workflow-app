package entities

const (
	// Common Errors
	ErrBadRequest              = "ErrMsgBadRequest"
	ErrNotFound                = "ErrMsgNotFound"
	ErrInternal                = "ErrMsgInternal"
	ErrUniqueIdentifierInvalid = "ErrMsgUniqueIdentifierInvalid"
	ErrUnauthorizedInvalid     = "ErrUnauthorizedInvalid"
	ErrPluginNotFound          = "ErrPluginNotFound"
	ErrInvokePlugin            = "ErrInvokePlugin"
	ErrPermissionDenied        = "ErrPermissionDenied"
)

const (
	ErrInternalCode          = -500
	ErrInvokePluginCode      = -501
	ErrBadRequestCode        = -400
	ErrPluginNotFoundCode    = -401
	ErrUnauthorizedCode      = -402
	ErrIdentifierInvalidCode = -403
	ErrNotFoundCode          = -404
	ErrPermissionDeniedCode  = -405
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
	return NewErrorWithType(ErrInternalCode, err.Error(), ErrInternal)
}

func BadRequestError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrBadRequestCode, err.Error(), ErrBadRequest)
}

func NotFoundError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrNotFoundCode, err.Error(), ErrNotFound)
}

func UniqueIdentifierInvalidError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrIdentifierInvalidCode, err.Error(), ErrUniqueIdentifierInvalid)
}

func UnauthorizedError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrUnauthorizedCode, err.Error(), ErrUnauthorizedInvalid)
}

func PluginNotFoundError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrPluginNotFoundCode, err.Error(), ErrPluginNotFound)
}

func InvokePluginError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrInvokePluginCode, err.Error(), ErrInvokePlugin)
}

func PermissionDeniedError(err error) PluginError {
	if err == nil {
		return nil
	}
	if pe, ok := err.(PluginError); ok {
		return pe
	}
	return NewErrorWithType(ErrPermissionDeniedCode, err.Error(), ErrPermissionDenied)
}
