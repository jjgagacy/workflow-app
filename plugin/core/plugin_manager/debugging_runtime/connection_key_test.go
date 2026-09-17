package debugging_runtime

import (
	"errors"
	"fmt"
	"testing"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/stretchr/testify/require"
)

const testTenantID = "272635fa-c96f-4ad4-b7c6-9406332ae89c"

func setupConnectionKeyTest(t *testing.T) ConnectionInfo {
	t.Helper()
	require.NoError(t, cache.InitRedisClient("0.0.0.0:6379", "", "", false, 0))
	_ = ClearConnectionKey(testTenantID)
	t.Cleanup(func() {
		_ = ClearConnectionKey(testTenantID)
	})

	return ConnectionInfo{TenantId: testTenantID}
}

func TestGetConnectionKeyCreatesRetrievableMapping(t *testing.T) {
	info := setupConnectionKeyTest(t)

	key, err := GetConnectionKey(info)
	require.NoError(t, err)
	require.NotEmpty(t, key)

	storedInfo, err := GetConnectionInfo(key)
	require.NoError(t, err)
	require.Equal(t, info, *storedInfo)
}

func TestGetConnectionKeyReusesTenantKey(t *testing.T) {
	info := setupConnectionKeyTest(t)

	firstKey, err := GetConnectionKey(info)
	require.NoError(t, err)
	secondKey, err := GetConnectionKey(info)
	require.NoError(t, err)

	require.Equal(t, firstKey, secondKey)
}

func TestClearConnectionKeyRemovesBothMappings(t *testing.T) {
	info := setupConnectionKeyTest(t)

	key, err := GetConnectionKey(info)
	require.NoError(t, err)
	require.NoError(t, ClearConnectionKey(info.TenantId))

	_, err = GetConnectionInfo(key)
	require.True(t, errors.Is(err, cache.ErrNotFound))
	require.True(t, errors.Is(ClearConnectionKey(info.TenantId), cache.ErrNotFound))
}

func TestGetConnectionKeyAndNotClear(t *testing.T) {
	require.NoError(t, cache.InitRedisClient("0.0.0.0:6379", "", "", false, 0))
	info := ConnectionInfo{TenantId: testTenantID}
	key, err := GetConnectionKey(info)
	require.NoError(t, err)
	require.NotEmpty(t, key)

	fmt.Printf("key: %s\n", key)

	storedInfo, err := GetConnectionInfo(key)
	require.NoError(t, err)
	require.Equal(t, info, *storedInfo)
}
