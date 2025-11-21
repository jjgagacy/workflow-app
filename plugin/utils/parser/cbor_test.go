package parser

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type User struct {
	ID        string         `cbor:"1,keyasint"`
	Name      string         `cbor:"2,keyasint"`
	Age       int            `cbor:"3,keyasint"`
	Email     string         `cbor:"4,keyasint,omitempty"`
	CreatedAt time.Time      `cbor:"5,keyasint"`
	Tags      []string       `cbor:"6,keyasint"`
	Metadata  map[string]any `cbor:"7,keyasint"`
}

type Product struct {
	SKU      string   `cbor:"1,keyasint"`
	Name     string   `cbor:"2,keyasint"`
	Price    float64  `cbor:"3,keyasint"`
	InStock  bool     `cbor:"4,keyasint"`
	Features []string `cbor:"5,keyasint"`
}

func TestMarshalUnmarshal_BasicTypes(t *testing.T) {
	tests := []struct {
		name  string
		input any
	}{
		{"string", "hello, world"},
		{"int", 42},
		{"float", 3.14159},
		{"bool", true},
		{"slice", []string{"a", "b", "c"}},
		{"map", map[string]int{"one": 1, "two": 2}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data, err := CBORMarshal(tt.input)
			require.NoError(t, err)
			assert.NotEmpty(t, data)

			var result any
			switch v := tt.input.(type) {
			case string:
				result, err = CBORUnmarshal[string](data)
				assert.Equal(t, v, result)
			case int:
				result, err = CBORUnmarshal[int](data)
				assert.Equal(t, v, result)
			case float64:
				result, err = CBORUnmarshal[float64](data)
				assert.InEpsilon(t, v, result, 0.0001)
			case bool:
				result, err = CBORUnmarshal[bool](data)
				assert.Equal(t, v, result)
			case []string:
				result, err = CBORUnmarshal[[]string](data)
				assert.Equal(t, v, result)
			case map[string]int:
				result, err = CBORUnmarshal[map[string]int](data)
				assert.Equal(t, v, result)
			}
			assert.NoError(t, err)
		})
	}
}

func TestMarshalUnmarshal_Structs(t *testing.T) {
	now := time.Now().UTC()

	user := User{
		ID:        "user-123",
		Name:      "Alice Smith",
		Age:       30,
		Email:     "alice@example.com",
		CreatedAt: now,
		Tags:      []string{"admin", "premium"},
		Metadata: map[string]any{
			"subscription": "pro",
			"login_count":  42,
		},
	}

	t.Run("User struct", func(t *testing.T) {
		data, err := CBORMarshal(user)
		require.NoError(t, err)
		require.NotEmpty(t, data)

		decoded, err := CBORUnmarshal[User](data)
		require.NoError(t, err)

		assert.Equal(t, user.ID, decoded.ID)
		assert.Equal(t, user.Name, decoded.Name)
		assert.Equal(t, user.Age, decoded.Age)
		assert.Equal(t, user.Email, decoded.Email)
		assert.WithinDuration(t, user.CreatedAt, decoded.CreatedAt, time.Second)
		assert.Equal(t, user.Tags, decoded.Tags)
		// assert.Equal(t, user.Metadata, decoded.Metadata) // error
		// 修复：使用类型断言处理数字类型差异
		assert.Equal(t, user.Metadata["subscription"], decoded.Metadata["subscription"])

		// 对于数字字段，比较数值而不是类型
		expectedCount, _ := user.Metadata["login_count"].(int)
		actualCount, ok := decoded.Metadata["login_count"].(uint64)
		if ok {
			assert.Equal(t, uint64(expectedCount), actualCount)
		} else {
			// 也可能是其他整数类型
			actualCountInt, ok := decoded.Metadata["login_count"].(int)
			if ok {
				assert.Equal(t, expectedCount, actualCountInt)
			} else {
				t.Errorf("login_count has unexpected type: %T", decoded.Metadata["login_count"])
			}
		}
	})
}

func TestMarshalUnmarshal_EdgeCases(t *testing.T) {
	t.Run("empty data", func(t *testing.T) {
		// 空字节切片应该报错
		_, err := CBORUnmarshal[string]([]byte{})
		assert.Error(t, err)
	})

	t.Run("nil data", func(t *testing.T) {
		// nil 字节切片应该报错
		_, err := CBORUnmarshal[string](nil)
		assert.Error(t, err)
	})

	t.Run("invalid CBOR data", func(t *testing.T) {
		// 无效的 CBOR 数据应该报错
		invalidData := []byte{0xFF, 0xFF, 0xFF} // 无效的 CBOR
		_, err := CBORUnmarshal[string](invalidData)
		assert.Error(t, err)
	})

	t.Run("type mismatch", func(t *testing.T) {
		// 序列化字符串但尝试解码为整数应该报错
		data, err := CBORMarshal("hello")
		require.NoError(t, err)

		_, err = CBORUnmarshal[int](data)
		assert.Error(t, err)
	})

	t.Run("zero value", func(t *testing.T) {
		// 测试零值
		data, err := CBORMarshal(0)
		require.NoError(t, err)

		result, err := CBORUnmarshal[int](data)
		require.NoError(t, err)
		assert.Equal(t, 0, result)
	})
}
