package debugging_runtime

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/redis/go-redis/v9"
)

type ConnectionInfo struct {
	TenantId string `json:"tenant_id" validate:"required"`
}

type ConnectionKey struct {
	Key string `json:"key" validate:"required"`
}

const (
	CONNECTION_KEY_MANAGER_KEY2ID_PREFIX = "{remote:key:manager}:key2id"
	CONNECTION_KEY_MANAGER_ID2KEY_PREFIX = "{remote:key:manager}:id2key"
	CONNECTION_KEY_EXPIRE_TIME           = time.Minute * 120 * 2 // 4 hours
)

// Returns a random string, create it if not exists
func GetConnectionKey(info ConnectionInfo) (string, error) {
	var key *ConnectionKey
	var err error

	key, err = cache.Get[ConnectionKey](
		strings.Join([]string{CONNECTION_KEY_MANAGER_ID2KEY_PREFIX, info.TenantId}, ":"),
	)
	if err == cache.ErrNotFound {
		err := cache.Transaction(func(p redis.Pipeliner) error {
			k := uuid.New().String()
			_, err = cache.SetNX(
				strings.Join([]string{CONNECTION_KEY_MANAGER_ID2KEY_PREFIX, info.TenantId}, ":"),
				ConnectionKey{Key: k},
				CONNECTION_KEY_EXPIRE_TIME,
				p,
			)
			if err != nil {
				return err
			}
			_, err = cache.SetNX(
				strings.Join([]string{CONNECTION_KEY_MANAGER_KEY2ID_PREFIX, k}, ":"),
				info,
				CONNECTION_KEY_EXPIRE_TIME,
				p,
			)
			if err != nil {
				return err
			}
			key = &ConnectionKey{Key: k}
			return nil
		})

		if err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	} else {
		// update expire time
		_, err = cache.Expire(strings.Join([]string{CONNECTION_KEY_MANAGER_ID2KEY_PREFIX, info.TenantId}, ":"), CONNECTION_KEY_EXPIRE_TIME)
		if err != nil {
			utils.Error("failed to update connection key expire time: %s", err.Error())
		}

		// update expire time for key
		_, err = cache.Expire(strings.Join([]string{CONNECTION_KEY_MANAGER_KEY2ID_PREFIX, key.Key}, ":"), CONNECTION_KEY_EXPIRE_TIME)
		if err != nil {
			utils.Error("failed to update connection key expire time: %s", err.Error())
		}
	}
	return key.Key, nil
}

// get connection info by key
func GetConnectionInfo(key string) (*ConnectionInfo, error) {
	info, err := cache.Get[ConnectionInfo](
		strings.Join([]string{CONNECTION_KEY_MANAGER_KEY2ID_PREFIX, key}, ":"),
	)
	if err != nil {
		return nil, err
	}
	return info, nil
}

// clear connection key
func ClearConnectionKey(tenant_id string) error {
	key, err := cache.Get[ConnectionKey](
		strings.Join([]string{CONNECTION_KEY_MANAGER_ID2KEY_PREFIX, tenant_id}, ":"),
	)

	if err != nil {
		return err
	}

	cache.Del(strings.Join([]string{CONNECTION_KEY_MANAGER_KEY2ID_PREFIX, key.Key}, ":"))
	cache.Del(strings.Join([]string{CONNECTION_KEY_MANAGER_ID2KEY_PREFIX, tenant_id}, ":"))
	return nil
}
