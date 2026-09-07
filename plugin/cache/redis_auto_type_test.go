package cache

import (
	"errors"
	"fmt"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAutoTypeWithoutInit(t *testing.T) {
	originalClient := client
	client = nil
	t.Cleanup(func() {
		client = originalClient
	})

	err := AutoSet("auto:no-init", User{ID: "u-1"})
	assert.ErrorIs(t, err, ErrDbNotInit)

	result, err := AutoGet[User]("auto:no-init")
	assert.Nil(t, result)
	assert.ErrorIs(t, err, ErrDbNotInit)

	deleted, err := AutoDelete[User]("auto:no-init")
	assert.Equal(t, int64(0), deleted)
	assert.ErrorIs(t, err, ErrDbNotInit)
}

func TestAutoTypeSetGetDelete(t *testing.T) {
	require.NoError(t, getConnection())
	defer Close()

	key := fmt.Sprintf("auto:user:%d", time.Now().UnixNano())
	t.Cleanup(func() {
		_, _ = AutoDelete[User](key)
	})

	input := User{
		ID:    "user-1",
		Name:  "Alice",
		Email: "alice@example.com",
		Age:   30,
	}
	require.NoError(t, AutoSet(key, input))

	got, err := AutoGet[User](key)
	require.NoError(t, err)
	require.NotNil(t, got)
	assert.Equal(t, input, *got)

	deleted, err := AutoDelete[User](key)
	require.NoError(t, err)
	assert.Equal(t, int64(1), deleted)

	got, err = AutoGet[User](key)
	assert.Nil(t, got)
	assert.EqualError(t, err, "not found")
}

func TestAutoGetWithGetterFallback(t *testing.T) {
	require.NoError(t, getConnection())
	defer Close()

	key := fmt.Sprintf("auto:fallback:%d", time.Now().UnixNano())
	_, _ = AutoDelete[Product](key)
	t.Cleanup(func() {
		_, _ = AutoDelete[Product](key)
	})

	var getterCalls int32
	getter := func() (*Product, error) {
		atomic.AddInt32(&getterCalls, 1)
		return &Product{
			ID:    "product-1",
			Name:  "Starter Plan",
			Price: 9.9,
		}, nil
	}

	first, err := AutoGetWithGetter[Product](key, getter)
	require.NoError(t, err)
	require.NotNil(t, first)
	assert.Equal(t, int32(1), atomic.LoadInt32(&getterCalls))

	second, err := AutoGetWithGetter[Product](key, getter)
	require.NoError(t, err)
	require.NotNil(t, second)
	assert.Equal(t, *first, *second)
	assert.Equal(t, int32(1), atomic.LoadInt32(&getterCalls), "getter should not be called when cache hit")
}

func TestAutoGetWithGetterGetterError(t *testing.T) {
	require.NoError(t, getConnection())
	defer Close()

	key := fmt.Sprintf("auto:getter-error:%d", time.Now().UnixNano())
	_, _ = AutoDelete[User](key)
	t.Cleanup(func() {
		_, _ = AutoDelete[User](key)
	})

	wantErr := errors.New("getter failed")
	got, err := AutoGetWithGetter[User](key, func() (*User, error) {
		return nil, wantErr
	})

	assert.Nil(t, got)
	assert.ErrorIs(t, err, wantErr)
}

func TestAutoTypeDifferentKeysOverrideByTypeKey(t *testing.T) {
	require.NoError(t, getConnection())
	defer Close()

	keyA := fmt.Sprintf("auto:isolation:a:%d", time.Now().UnixNano())
	keyB := fmt.Sprintf("auto:isolation:b:%d", time.Now().UnixNano())
	t.Cleanup(func() {
		_, _ = AutoDelete[User](keyA)
		_, _ = AutoDelete[User](keyB)
	})

	userA := User{ID: "A", Name: "A-Name", Email: "a@example.com", Age: 18}
	userB := User{ID: "B", Name: "B-Name", Email: "b@example.com", Age: 28}

	require.NoError(t, AutoSet(keyA, userA))
	require.NoError(t, AutoSet(keyB, userB))

	gotA, err := AutoGet[User](keyA)
	require.NoError(t, err)
	require.NotNil(t, gotA)
	assert.Equal(t, userB, *gotA)

	gotB, err := AutoGet[User](keyB)
	require.NoError(t, err)
	require.NotNil(t, gotB)
	assert.Equal(t, userB, *gotB)
}
