package utils

import (
	"encoding/json"
	"reflect"

	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/xeipuuv/gojsonschema"
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

// Generate a valid json from its json schema
func GenerateValidateJson(schema map[string]any) (map[string]any, error) {
	// Since gojsonschema doesn't provide a direct way to generate valid JSON from a schema,
	// we'll need to implement our own logic based on the schema structure
	result := map[string]any{}

	schemaLoader := gojsonschema.NewGoLoader(schema)
	schemaDoc, err := schemaLoader.LoadJSON()
	if err != nil {
		return nil, err
	}

	// Process the schema document and generate valid JSON
	if schemaType, ok := schemaDoc.(map[string]any)["type"].(string); ok && schemaType == "object" {
		// Get properties
		if properties, ok := schemaDoc.(map[string]any)["properties"].(map[string]any); ok {
			for propName, propSchema := range properties {
				propMap, ok := propSchema.(map[string]any)
				if !ok {
					continue
				}

				propType, _ := propMap["type"].(string)
				switch propType {
				case "string":
					if enum, ok := propMap["enum"].([]any); ok && len(enum) > 0 {
						result[propName] = enum[0]
					} else {
						result[propName] = RandomString(10)
					}
				case "number", "integer":
					if enum, ok := propMap["enum"].([]any); ok && len(enum) > 0 {
						result[propName] = enum[0]
					} else {
						min := 0.0
						max := 100.0

						if minVal, ok := propMap["minimum"].(float64); ok {
							min = minVal
						}
						if maxVal, ok := propMap["maximum"].(float64); ok {
							max = maxVal
						}
						result[propName] = min + (max-min)/2
					}
				case "boolean":
					result[propName] = true
				case "array":
					arr := []any{}

					if items, ok := propMap["items"].(map[string]any); ok {
						itemType, _ := items["type"].(string)
						switch itemType {
						case "string":
							arr = append(arr, "item0")
						case "number", "integer":
							arr = append(arr, 42)
						case "boolean":
							arr = append(arr, true)
						}
					}

					result[propName] = arr
				case "object":
					nestedObj := map[string]any{}

					if nestedProps, ok := propMap["properties"].(map[string]any); ok {
						for nestedPropName, nestedPropSchema := range nestedProps {
							if nestedPropMap, ok := nestedPropSchema.(map[string]any); ok {
								nestedType, _ := nestedPropMap["type"].(string)
								switch nestedType {
								case "string":
									nestedObj[nestedPropName] = "nested_" + nestedPropName
								case "number", "integer":
									nestedObj[nestedPropName] = 42
								case "boolean":
									nestedObj[nestedPropName] = true
								}
							}
						}
					}

					result[propName] = nestedObj
				}
			}
		}
	}
	return result, nil
}
