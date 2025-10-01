package utils

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/mitchellh/mapstructure"
)

func StructToMap(data any) map[string]any {
	result := make(map[string]any)

	decConfig := &mapstructure.DecoderConfig{
		Metadata: nil,
		Result:   &result,
		TagName:  "json",
		Squash:   true,
	}

	d, err := mapstructure.NewDecoder(decConfig)
	if err != nil {
		return nil
	}

	err = d.Decode(data)
	if err != nil {
		return nil
	}

	return result
}

func MapToStruct[T any](m map[string]any) (*T, error) {
	var s T
	decoderConfig := &mapstructure.DecoderConfig{
		Metadata: nil,
		Result:   &s,
		TagName:  "json",
		Squash:   true,
	}

	decoder, err := mapstructure.NewDecoder(decoderConfig)
	if err != nil {
		return nil, fmt.Errorf("error creating decoder: %s", err)
	}

	err = decoder.Decode(m)
	if err != nil {
		return nil, fmt.Errorf("error decoding map: %s", err)
	}

	if err := validators.EntitiesValidator.Struct(s); err != nil {
		return nil, fmt.Errorf("error validating struct: %s", err)
	}

	return &s, nil
}
