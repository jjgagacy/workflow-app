package utils

import (
	"encoding/json"
	"reflect"

	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

func MarshalJson[T any](data T) string {
	b, _ := json.Marshal(data)
	return string(b)
}

func MarshalJsonBytes[T any](data T) []byte {
	b, _ := json.Marshal(data)
	return b
}

func UnmarshalJson[T any](str string) (T, error) {
	return UnmarshalJsonBytes[T]([]byte(str))
}

func UnmarshalJsonBytes[T any](data []byte) (T, error) {
	var result T
	err := json.Unmarshal(data, &result)
	if err != nil {
		return result, err
	}

	// skip validate if T is a map
	typ := reflect.TypeOf(result)
	if typ.Kind() == reflect.Map {
		return result, nil
	}

	kind := typ.Kind()
	// 跳过验证的类型：map、string、基本类型、指针、切片等
	switch kind {
	case reflect.Map, reflect.String, reflect.Bool,
		reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64,
		reflect.Float32, reflect.Float64, reflect.Complex64, reflect.Complex128,
		reflect.Slice, reflect.Array, reflect.Pointer, reflect.Interface:
		return result, nil
	}

	// validate
	if kind == reflect.Struct {
		if err := validators.EntitiesValidator.Struct(&result); err != nil {
			return result, err
		}
	}

	return result, nil
}

func UnmarshalJsonBytesToMap(data []byte) (map[string]any, error) {
	result := map[string]any{}
	err := json.Unmarshal(data, &result)
	if err != nil {
		return nil, err
	}
	return result, err
}
