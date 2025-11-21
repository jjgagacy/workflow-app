package persistence

import (
	"encoding/hex"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	persistence *Persistence
)

type Persistence struct {
	maxStorageSize int64

	storage PersistenceStorage
}

func InitPersistence(oss oss.OSS, config *core.Config) {
	persistence = &Persistence{
		storage:        NewWrapper(oss, config.PersistenceStoragePath),
		maxStorageSize: config.PersistenceStorageMaxSize,
	}

	utils.Info("Persistence initialized")
}

func GetPersistence() *Persistence {
	return persistence
}

func (c *Persistence) getCacheKey(tenantId string, pluginId string, key string) string {
	return fmt.Sprintf("%s:%s:%s:%s", CACHE_KEY_PREFIX, tenantId, pluginId, key)
}

func (c *Persistence) checkPathTraversal(key string) error {
	key = path.Clean(key)
	if strings.Contains(key, "..") || strings.Contains(key, "//") || strings.Contains(key, "\\") {
		return fmt.Errorf("invalid key: path traversal attempt detected")
	}
	return nil
}

func (c *Persistence) Save(tenantId string, pluginId string, key string, maxSize int64, data []byte) error {
	if err := c.checkPathTraversal(key); err != nil {
		return err
	}

	if len(key) > 256 {
		return fmt.Errorf("key length must be less than 256 characters")
	}

	if maxSize == -1 {
		maxSize = c.maxStorageSize
	}

	if err := c.storage.Save(tenantId, pluginId, key, data); err != nil {
		return err
	}

	allocatedSize := int64(len(data))

	storage, err := db.GetOne[model.TenantStorage](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
	)
	if err != nil {
		if allocatedSize > c.maxStorageSize || allocatedSize > maxSize {
			return fmt.Errorf("allocated size is greater than max storage size")
		}

		if err == types.ErrRecordNotFound {
			storage = model.TenantStorage{
				TenantID: tenantId,
				PluginID: pluginId,
				Size:     allocatedSize,
			}
			if err := db.Create(&storage); err != nil {
				return err
			}
		} else {
			return err
		}
	} else {
		if allocatedSize+storage.Size > maxSize || allocatedSize+storage.Size > c.maxStorageSize {
			return fmt.Errorf("allocated size is greater than max storage size")
		}

		err = db.Run(
			db.Model(&model.TenantStorage{}),
			db.Equal("tenant_id", tenantId),
			db.Equal("plugin_id", pluginId),
			db.Inc(map[string]int64{"size": allocatedSize}),
		)
		if err != nil {
			return err
		}
	}

	// delete from cache
	if _, err := cache.Del(c.getCacheKey(tenantId, pluginId, key)); err == cache.ErrNotFound {
		return nil
	}
	return err
}

func (c *Persistence) Load(tenantId string, pluginId string, key string) ([]byte, error) {
	if err := c.checkPathTraversal(key); err != nil {
		return nil, err
	}

	// check if the key exists in cache
	val, err := cache.GetString(c.getCacheKey(tenantId, pluginId, key))
	if err != nil && err != cache.ErrNotFound {
		return nil, err
	}
	if err == nil {
		return hex.DecodeString(val)
	}

	// load from storage
	data, err := c.storage.Load(tenantId, pluginId, key)
	if err != nil {
		return nil, err
	}

	// add to cache
	cache.Store(c.getCacheKey(tenantId, pluginId, key), hex.EncodeToString(data), time.Minute*5)
	return data, nil
}

// Delete delete tenant plugin key
// returns teh deleted num
func (c *Persistence) Delete(tenantId string, pluginId string, key string) (int64, error) {
	// delete from cache
	deletedNum, err := cache.Del(c.getCacheKey(tenantId, pluginId, key))
	if err != nil {
		return 0, err
	}

	// state size
	size, err := c.storage.StateSize(tenantId, pluginId, key)
	if err != nil {
		return 0, err
	}

	err = c.storage.Delete(tenantId, pluginId, key)
	if err != nil {
		return 0, err
	}

	// update storage size
	err = db.Run(
		db.Model(&model.TenantStorage{}),
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
		db.Dec(map[string]int64{"size": size}),
	)
	if err != nil {
		return 0, err
	}

	return deletedNum, nil
}

func (c *Persistence) Exists(tenantId string, pluginId string, key string) (int64, error) {
	// check cache first
	existNum, err := cache.Exist(c.getCacheKey(tenantId, pluginId, key))
	if err != nil {
		return 0, err
	}
	if existNum > 0 {
		return existNum, nil
	}

	isExist, err := c.storage.Exists(tenantId, pluginId, key)
	if err != nil {
		return 0, err
	}
	if isExist {
		return 1, nil
	}
	return 0, nil
}
