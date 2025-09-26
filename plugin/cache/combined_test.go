package cache

import (
	"testing"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/stretchr/testify/assert"
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

	for i := 0; i < goRoutines; i++ {
		go func(id int) {
			for j := 0; j < iterations; j++ {
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

	for i := 0; i < goRoutines; i++ {
		<-done
	}

	pluginCache.RLock()
	defer pluginCache.RUnlock()

	assert.True(t, pluginCache.itemSize <= maxCacheSize)
}
