package encryption

import (
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func MaskConfigCredentials(
	credentials map[string]any,
	providerConfig []plugin_entities.ProviderConfig,
) map[string]any {
	configs := make(map[string]plugin_entities.ProviderConfig)
	for _, config := range providerConfig {
		configs[config.Name] = config
	}

	copiedCredentials := make(map[string]any)
	for key, value := range credentials {
		if config, ok := configs[key]; ok {
			if config.Type == string(plugin_entities.CONFIG_TYPE_SECRET_INPUT) {
				if originalValue, ok := value.(string); ok {
					if len(originalValue) > 6 {
						copiedCredentials[key] = originalValue[:2] +
							strings.Repeat("*", len(originalValue)-4) +
							originalValue[len(originalValue)-2:]
					} else {
						copiedCredentials[key] = strings.Repeat("*", len(originalValue))
					}
				}
			} else {
				copiedCredentials[key] = value
			}
		} else {
			copiedCredentials[key] = value
		}
	}
	return copiedCredentials
}
