package utils

import (
	"github.com/go-playground/validator/v10"
	"gopkg.in/yaml.v3"
)

func UnmarshalYaml[T any](text string, validator ...validator.Validate) (T, error) {
	return UnmarshalYamlBytes[T]([]byte(text), validator...)
}

func UnmarshalYamlBytes[T any](data []byte, validator ...validator.Validate) (T, error) {
	var result T
	err := yaml.Unmarshal(data, &result)
	if err != nil {
		return result, err
	}

	if len(validator) > 0 {
		if err := validator[0].Struct(result); err != nil {
			return result, err
		}
	}

	return result, err
}
