package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type User struct {
	Name  string `json:"name" validate:"required"`
	Age   int    `json:"age" validate:"min=0"`
	Email string `json:"email" validate:"email"`
}

type Product struct {
	ID    string  `json:"id" validate:"required"`
	Price float64 `json:"price" validate:"min=0"`
}

func TestMarshalJson(t *testing.T) {
	tests := []struct {
		name     string
		input    any
		expected string
	}{
		{
			name:     "marshal string",
			input:    "hello world",
			expected: `"hello world"`,
		},
		{
			name:     "marshal map",
			input:    map[string]any{"key": "value"},
			expected: `{"key":"value"}`,
		},
		{
			name:     "marshal nil",
			input:    nil,
			expected: "null",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := MarshalJson(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestMarshalJsonBytes(t *testing.T) {
	tests := []struct {
		name     string
		input    any
		expected []byte
	}{
		{
			name:     "marshal bytes for struct",
			input:    User{Name: "Alice", Age: 25},
			expected: []byte(`{"name":"Alice","age":25,"email":""}`),
		},
		{
			name:     "marshal bytes for slice",
			input:    []int{1, 2, 3},
			expected: []byte("[1,2,3]"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := MarshalJsonBytes(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestUnmarshalJson(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    User
		shouldError bool
	}{
		{
			name:        "unmarshal valid user",
			input:       `{"name":"Bob","age":35,"email":"bob@example.com"}`,
			expected:    User{Name: "Bob", Age: 35, Email: "bob@example.com"},
			shouldError: false,
		},
		{
			name:        "unmarshal invalid JSON",
			input:       `{"name": "Bob", "age": "invalid"}`,
			shouldError: true,
		},
		{
			name:        "unmarshal empty string",
			input:       "",
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var result User
			result, err := UnmarshalJson[User](tt.input)
			if tt.shouldError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestUnmarshalJsonBytes(t *testing.T) {
	tests := []struct {
		name        string
		input       []byte
		expected    any
		shouldError bool
		validate    bool
	}{
		{
			name:        "unmarshal valid struct with validation",
			input:       []byte(`{"name":"Charlie","age":40,"email":"charlie@example.com"}`),
			expected:    User{Name: "Charlie", Age: 40, Email: "charlie@example.com"},
			shouldError: false,
		},
		{
			name:        "unmarshal invalid struct - validation failed",
			input:       []byte(`{"name":"","age":-1,"email":"invalid-email"}`),
			expected:    User{}, // 期望返回零值
			shouldError: true,   // 但应该有错误
		},
		{
			name:        "unmarshal map - skip validation",
			input:       []byte(`{"key1":"value1","key2":123}`),
			expected:    map[string]any{"key1": "value1", "key2": float64(123)},
			shouldError: false,
		},
		{
			name:        "unmarshal string - skip validation",
			input:       []byte(`"hello world"`),
			expected:    "hello world",
			shouldError: false,
		},
		{
			name:        "unmarshal number",
			input:       []byte(`42`),
			expected:    float64(42),
			shouldError: false,
		},
		{
			name:        "unmarshal boolean",
			input:       []byte(`true`),
			expected:    true,
			shouldError: false,
		},
		{
			name:        "unmarshal nil bytes",
			input:       nil,
			expected:    float64(0), // 根据具体类型
			shouldError: true,
		},
		{
			name:        "unmarshal empty bytes",
			input:       []byte{},
			expected:    float64(0), // 根据具体类型
			shouldError: true,
		},
		{
			name:        "unmarshal invalid JSON",
			input:       []byte(`{invalid json`),
			expected:    float64(0),
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			switch expected := tt.expected.(type) {
			case User:
				result, err := UnmarshalJsonBytes[User](tt.input)
				if tt.shouldError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
					assert.Equal(t, expected, result)
				}
			case map[string]any:
				result, err := UnmarshalJsonBytes[map[string]any](tt.input)
				if tt.shouldError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
					assert.Equal(t, expected, result)
				}
			case string:
				result, err := UnmarshalJsonBytes[string](tt.input)
				if tt.shouldError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
					assert.Equal(t, expected, result)
				}
			case float64:
				result, err := UnmarshalJsonBytes[float64](tt.input)
				if tt.shouldError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
					assert.Equal(t, expected, result)
				}
			case bool:
				result, err := UnmarshalJsonBytes[bool](tt.input)
				if tt.shouldError {
					assert.Error(t, err)
					assert.Equal(t, false, result)
				} else {
					assert.NoError(t, err)
					assert.Equal(t, expected, result)
				}
			default:
				t.Fatalf("Unsupported type in test: %T", expected)
			}
		})
	}
}

func TestUnmarshalJsonBytesToMap(t *testing.T) {
	tests := []struct {
		name        string
		input       []byte
		expected    map[string]any
		shouldError bool
	}{
		{
			name:  "unmarshal simple object",
			input: []byte(`{"name":"David","age":28,"active":true}`),
			expected: map[string]any{
				"name":   "David",
				"age":    float64(28),
				"active": true,
			},
			shouldError: false,
		},
		{
			name:  "unmarshal nested object",
			input: []byte(`{"user":{"name":"Eve","age":32},"tags":["go","testing"]}`),
			expected: map[string]any{
				"user": map[string]any{
					"name": "Eve",
					"age":  float64(32),
				},
				"tags": []any{"go", "testing"},
			},
			shouldError: false,
		},
		{
			name:        "unmarshal empty object",
			input:       []byte(`{}`),
			expected:    map[string]any{},
			shouldError: false,
		},
		{
			name:        "unmarshal invalid JSON",
			input:       []byte(`{"name": "Eve", "age": }`),
			expected:    nil,
			shouldError: true,
		},
		{
			name:        "unmarshal nil input",
			input:       nil,
			expected:    nil,
			shouldError: true,
		},
		{
			name:        "unmarshal empty array", // 注意：这个应该失败，因为期望的是对象
			input:       []byte(`[]`),
			expected:    nil,
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := UnmarshalJsonBytesToMap(tt.input)

			if tt.shouldError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

// 测试边缘情况
func TestEdgeCases(t *testing.T) {
	t.Run("MarshalJson should not panic on circular references", func(t *testing.T) {
		// 测试循环引用（虽然会失败，但不应该panic）
		type Circular struct {
			Data string
			Next *Circular
		}

		circular := &Circular{Data: "test"}
		circular.Next = circular // 创建循环引用

		// 这里可能返回部分数据或空结果，但不应该panic
		assert.NotPanics(t, func() {
			_ = MarshalJson(circular)
		})
	})

	t.Run("UnmarshalJsonBytes with pointer type", func(t *testing.T) {
		data := []byte(`{"name":"Frank","age":45,"email":"frank@example.com"}`)

		result, err := UnmarshalJsonBytes[*User](data)
		require.NoError(t, err)
		require.NotNil(t, result)
		assert.Equal(t, "Frank", result.Name)
		assert.Equal(t, 45, result.Age)
	})

	t.Run("UnmarshalJsonBytes with slice type", func(t *testing.T) {
		data := []byte(`[{"name":"User1","age":20},{"name":"User2","age":25}]`)

		result, err := UnmarshalJsonBytes[[]User](data)
		require.NoError(t, err)
		require.Len(t, result, 2)
		assert.Equal(t, "User1", result[0].Name)
		assert.Equal(t, "User2", result[1].Name)
	})
}

func TestUnmarshalJsonBytesToMap2(t *testing.T) {
	tests := []struct {
		name        string
		input       []byte
		expected    map[string]any
		shouldError bool
	}{
		{
			name:  "unmarshal simple object",
			input: []byte(`{"name":"David","age":28,"active":true}`),
			expected: map[string]any{
				"name":   "David",
				"age":    float64(28), // JSON 数字默认解组为 float64
				"active": true,
			},
			shouldError: false,
		},
		{
			name:  "unmarshal nested object",
			input: []byte(`{"user":{"name":"Eve","age":32},"tags":["go","testing"]}`),
			expected: map[string]any{
				"user": map[string]any{
					"name": "Eve",
					"age":  float64(32),
				},
				"tags": []any{"go", "testing"},
			},
			shouldError: false,
		},
		{
			name:        "unmarshal empty object",
			input:       []byte(`{}`),
			expected:    map[string]any{},
			shouldError: false,
		},
		{
			name:        "unmarshal invalid JSON",
			input:       []byte(`{"name": "Eve", "age": }`),
			expected:    nil,
			shouldError: true,
		},
		{
			name:        "unmarshal nil input",
			input:       nil,
			expected:    nil,
			shouldError: true,
		},
		{
			name:        "unmarshal empty array", // 应该失败，因为期望的是对象
			input:       []byte(`[]`),
			expected:    nil,
			shouldError: true,
		},
		{
			name:  "unmarshal with null values",
			input: []byte(`{"name":null,"age":25,"data":null}`),
			expected: map[string]any{
				"name": nil,
				"age":  float64(25),
				"data": nil,
			},
			shouldError: false,
		},
		{
			name:  "unmarshal with special number values",
			input: []byte(`{"int":42,"float":3.14,"negative":-10,"scientific":1.23e4}`),
			expected: map[string]any{
				"int":        float64(42),
				"float":      float64(3.14),
				"negative":   float64(-10),
				"scientific": float64(12300),
			},
			shouldError: false,
		},
		{
			name:  "unmarshal with boolean values",
			input: []byte(`{"active":true,"inactive":false}`),
			expected: map[string]any{
				"active":   true,
				"inactive": false,
			},
			shouldError: false,
		},
		{
			name:  "unmarshal with empty string",
			input: []byte(`{"name":"","description":"non-empty"}`),
			expected: map[string]any{
				"name":        "",
				"description": "non-empty",
			},
			shouldError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := UnmarshalJsonBytesToMap(tt.input)

			if tt.shouldError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)

				// 详细验证每个字段
				assert.Equal(t, len(tt.expected), len(result), "map length should match")

				for key, expectedValue := range tt.expected {
					actualValue, exists := result[key]
					assert.True(t, exists, "key %s should exist", key)
					assert.Equal(t, expectedValue, actualValue, "value for key %s should match", key)
				}

				// 确保没有多余的字段
				for key := range result {
					_, exists := tt.expected[key]
					assert.True(t, exists, "unexpected key %s in result", key)
				}
			}
		})
	}
}

// 专门测试字段匹配的详细验证
func TestUnmarshalJsonBytesToMap_FieldMatching(t *testing.T) {
	t.Run("exact field matching", func(t *testing.T) {
		input := []byte(`{
            "string_field": "hello",
            "number_field": 123,
            "float_field": 45.67,
            "bool_field": true,
            "null_field": null,
            "array_field": [1, 2, 3],
            "object_field": {"nested": "value"}
        }`)

		expected := map[string]any{
			"string_field": "hello",
			"number_field": float64(123),
			"float_field":  float64(45.67),
			"bool_field":   true,
			"null_field":   nil,
			"array_field":  []any{float64(1), float64(2), float64(3)},
			"object_field": map[string]any{"nested": "value"},
		}

		result, err := UnmarshalJsonBytesToMap(input)
		require.NoError(t, err)
		require.NotNil(t, result)

		// 逐个字段验证
		assert.Equal(t, expected["string_field"], result["string_field"])
		assert.Equal(t, expected["number_field"], result["number_field"])
		assert.Equal(t, expected["float_field"], result["float_field"])
		assert.Equal(t, expected["bool_field"], result["bool_field"])
		assert.Equal(t, expected["null_field"], result["null_field"])
		assert.Equal(t, expected["array_field"], result["array_field"])
		assert.Equal(t, expected["object_field"], result["object_field"])
	})

	t.Run("field order should not matter", func(t *testing.T) {
		input1 := []byte(`{"a":1,"b":2,"c":3}`)
		input2 := []byte(`{"c":3,"a":1,"b":2}`)

		result1, err1 := UnmarshalJsonBytesToMap(input1)
		result2, err2 := UnmarshalJsonBytesToMap(input2)

		require.NoError(t, err1)
		require.NoError(t, err2)

		// 字段顺序不同但内容应该相同
		assert.Equal(t, result1, result2)
	})

	t.Run("case sensitive field names", func(t *testing.T) {
		input := []byte(`{"Name":"john","name":"doe","NAME":"smith"}`)

		result, err := UnmarshalJsonBytesToMap(input)
		require.NoError(t, err)

		// 字段名是大小写敏感的
		assert.Equal(t, "john", result["Name"])
		assert.Equal(t, "doe", result["name"])
		assert.Equal(t, "smith", result["NAME"])
	})

	t.Run("special characters in field names", func(t *testing.T) {
		input := []byte(`{
            "normal": "value1",
            "with-dash": "value2",
            "with_underscore": "value3",
            "with space": "value4",
            "with.dots": "value5",
            "withUppercase": "value6"
        }`)

		result, err := UnmarshalJsonBytesToMap(input)
		require.NoError(t, err)

		// 明确指定每个字段的期望值
		expected := map[string]any{
			"normal":          "value1",
			"with-dash":       "value2",
			"with_underscore": "value3",
			"with space":      "value4",
			"with.dots":       "value5",
			"withUppercase":   "value6",
		}

		// 验证每个字段
		for key, expectedValue := range expected {
			assert.Contains(t, result, key, "key %s should exist", key)
			assert.Equal(t, expectedValue, result[key], "value for key %s should match", key)
		}
	})
}
