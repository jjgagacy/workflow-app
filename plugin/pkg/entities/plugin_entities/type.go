package plugin_entities

import (
	"reflect"

	"github.com/go-playground/validator/v10"
)

type I18nObject struct {
	EnUs   string `json:"en_US"`
	ZhHans string `json:"zh_Hans,omitempty"`
}

func isBasicType(fl validator.FieldLevel) bool {
	switch fl.Field().Kind() {
	case reflect.String, reflect.Bool,
		reflect.Float64, reflect.Float32,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64,
		reflect.Int8, reflect.Int, reflect.Int16, reflect.Int32, reflect.Int64:
		return true
	case reflect.Ptr:
		// check if the pointer is nil
		if fl.Field().IsNil() {
			return true
		}
	default:
		return false
	}

	return false
}
