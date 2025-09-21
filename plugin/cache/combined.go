package cache

import (
	"strings"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
)

var (
	maxCacheSize = int64(1024)
	maxTTL       = 600 * time.Second
)

type cacheItem struct {
	declaration *plugin_entities.PluginDeclaration
	accessCount int64
	lastAccess  time.Time
}

type cache struct {
	sync.RWMutex
	items    map[string]*cacheItem
	itemSize int64
}

var (
	pluginCache = &cache{
		items:    make(map[string]*cacheItem),
		itemSize: 0,
	}
)

func (c *cache) get(key string) *plugin_entities.PluginDeclaration {
	c.RLock()
	item, exists := c.items[key]
	c.RUnlock()

	if time.Since(item.lastAccess) > maxTTL {
		c.Lock()
		// Double checking after acquiring write lock
		if item, exists = c.items[key]; exists {
			if time.Since(item.lastAccess) > maxTTL {
				c.itemSize--
				delete(c.items, key)
			}
		}
		c.Unlock()
		return nil
	}

	// update access count and time
	c.Lock()
	if item, exists := c.items[key]; exists {
		item.accessCount++
		item.lastAccess = time.Now()
	}
	c.Unlock()

	if exists {
		return item.declaration
	}
	return nil
}

func (c *cache) set(key string, declaration *plugin_entities.PluginDeclaration) {
	c.Lock()
	defer c.Unlock()

	// Clean if expired
	now := time.Now()
	for k, v := range c.items {
		if now.Sub(v.lastAccess) > maxTTL {
			c.itemSize--
			delete(c.items, k)
		}
	}

	// Remove last access items if cache is full
	if c.itemSize >= maxCacheSize {
		var key string
		var count int64 = -1
		var oldest = time.Now()

		for k, v := range c.items {
			// Prioritize by access count, then by age
			if count == -1 || v.accessCount < count || (v.accessCount == count && v.lastAccess.Before(oldest)) {
				count = v.accessCount
				oldest = v.lastAccess
				key = k
			}
		}

		if key != "" {
			c.itemSize--
			delete(c.items, key)
		}
	}

	// Add
	c.items[key] = &cacheItem{
		declaration: declaration,
		accessCount: 1,
		lastAccess:  now,
	}
	c.itemSize++
}

func CombinedGetPluginDeclaration(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	runtimeType plugin_entities.PluginRuntimeType,
) (*plugin_entities.PluginDeclaration, error) {
	cacheKey := strings.Join(
		[]string{
			"declaration_cache",
			string(runtimeType),
			string(pluginUniqueIdentifier),
		},
		":",
	)

	if declaration := pluginCache.get(cacheKey); declaration != nil {
		return declaration, nil
	}

	// todo redis
	var declaration plugin_entities.PluginDeclaration
	var err error
	if runtimeType != plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE {
		pluginDeclaration, err := db.GetOne[model.PluginDeclaration](
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
		)

		if err == nil {
			declaration = pluginDeclaration.Declaration
		}
	} else {
		// todo: fetch plugin from remote
		plugin, err := db.GetOne[model.Plugin](
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
			db.Equal("install_type", string(plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE)),
		)

		if err == nil {
			declaration = plugin.RemoteDeclaration
			err = nil
		}
	}

	if err == types.ErrRecordNotFound {
		return nil, types.ErrPluginNotFound
	}
	if err != nil {
		return nil, err
	}

	pluginCache.set(cacheKey, &declaration)

	return &declaration, nil
}
