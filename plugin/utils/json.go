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

	// skip string
	if typ.Kind() == reflect.String {
		return result, nil
	}

	if err := validators.EntitiesValidator.Struct(&result); err != nil {
		return result, err
	}

	return result, nil
}
