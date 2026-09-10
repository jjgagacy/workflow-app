package cache

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestCacheSetAndGet(t *testing.T) {
	pluginCache := &cache{
		items:    make(map[string]*cacheItem),
		itemSize: 0,
	}
	declaration := &plugin_entities.PluginDeclaration{
		PluginDeclarationBaseFields: plugin_entities.PluginDeclarationBaseFields{
			Author: "alex",
			Name:   "xu",
		},
		Model: &plugin_entities.ModelProviderDeclaration{
			Provider: "openai",
		},
	}
	key := "test:key"
	pluginCache.set(key, declaration)

	result := pluginCache.get(key)
	assert.NotNil(t, result)
	assert.Equal(t, "openai", result.Model.Provider)
	// get non-existing item
	result = pluginCache.get("non-existing-key")
	assert.Nil(t, result)
}

func TestCacheConcurrentAccess(t *testing.T) {
	pluginCache := &cache{
		items:    make(map[string]*cacheItem),
		itemSize: 0,
	}
	const goRoutines = 10
	const iterations = 100

	done := make(chan bool)

	for i := range goRoutines {
		go func(id int) {
			for j := range iterations {
				key := string(rune(id)) + ":" + string(rune(j))
				declaration := &plugin_entities.PluginDeclaration{
					PluginDeclarationBaseFields: plugin_entities.PluginDeclarationBaseFields{
						Author: "alex",
						Name:   "xu",
					},
					Model: &plugin_entities.ModelProviderDeclaration{
						Provider: "google",
					},
				}

				pluginCache.set(key, declaration)
				result := pluginCache.get(key)

				assert.NotNil(t, result)
				assert.Equal(t, "google", result.Model.Provider)
			}
			done <- true
		}(i)
	}

	for range goRoutines {
		<-done
	}

	pluginCache.RLock()
	defer pluginCache.RUnlock()

	assert.True(t, pluginCache.itemSize <= maxCacheSize)
}

func TestCombinedGetPluginDeclarationMemoryCacheHit(t *testing.T) {
	identifier, err := plugin_entities.NewPluginUniqueIdentifier(fmt.Sprintf("alex/xu-%d:1.0.0", time.Now().UnixNano()))
	require.NoError(t, err)
	runtimeType := plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL

	declaration := &plugin_entities.PluginDeclaration{
		PluginDeclarationBaseFields: plugin_entities.PluginDeclarationBaseFields{
			Author: "alex",
			Name:   "xu",
		},
		Model: &plugin_entities.ModelProviderDeclaration{
			Provider: "openai",
		},
	}

	cacheKey := strings.Join([]string{"declaration_cache", string(runtimeType), string(identifier)}, ":")
	pluginCache.set(cacheKey, declaration)
	t.Cleanup(func() {
		pluginCache.Lock()
		delete(pluginCache.items, cacheKey)
		pluginCache.Unlock()
	})

	result, err := CombinedGetPluginDeclaration(identifier, runtimeType)
	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, "openai", result.Model.Provider)
}

func TestCombinedGetPluginDeclarationRedisNotInit(t *testing.T) {
	identifier, err := plugin_entities.NewPluginUniqueIdentifier(fmt.Sprintf("alex/xu-%d:1.0.0", time.Now().UnixNano()))
	require.NoError(t, err)
	runtimeType := plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL

	originalClient := client
	client = nil
	t.Cleanup(func() {
		client = originalClient
	})

	result, err := CombinedGetPluginDeclaration(identifier, runtimeType)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, ErrDbNotInit)
}

func setUpTestDB() *gorm.DB {
	db.Init(&core.Config{
		DBType:            "postgresql",
		DBHost:            "localhost",
		DBPort:            5432,
		DBDatabase:        "workflow_plugin",
		DBDefaultDatabase: "",
		DBUsername:        "alex",
		DBPassword:        func(s string) *string { return &s }(""),
		DBSslMode:         "disable",

		DBMaxIdleConns:    10,
		DBMaxOpenConns:    30,
		DBConnMaxLifetime: 3600,
		DBExtras:          "",
		DBCharset:         "utf8",
		DBTimeZone:        "Asia/Shanghai",
	})

	return db.DB
}

func TestCombinedGetPluginDeclaration(t *testing.T) {
	setUpTestDB()
	InitRedisClient("0.0.0.0:6379", "", "", false, 0)
	identifier, err := plugin_entities.NewPluginUniqueIdentifier("monyii/openai:1.0.0")
	require.NoError(t, err)

	runtimeType := plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL

	result, err := CombinedGetPluginDeclaration(identifier, runtimeType)
	assert.NotNil(t, result)
	assert.NoError(t, err)
}
