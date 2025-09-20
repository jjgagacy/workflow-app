package manifest_entites

import "github.com/go-playground/validator/v10"

type PluginTag string

const (
	PLUGIN_TAG_SEARCH        PluginTag = "search"
	PLUGIN_TAG_IMAGE         PluginTag = "image"
	PLUGIN_TAG_VIDEOS        PluginTag = "videos"
	PLUGIN_TAG_WEATHER       PluginTag = "weather"
	PLUGIN_TAG_FINANCE       PluginTag = "finance"
	PLUGIN_TAG_DESIGN        PluginTag = "design"
	PLUGIN_TAG_TRAVEL        PluginTag = "travel"
	PLUGIN_TAG_SOCIAL        PluginTag = "social"
	PLUGIN_TAG_NEWS          PluginTag = "news"
	PLUGIN_TAG_MEDICAL       PluginTag = "medical"
	PLUGIN_TAG_PRODUCTIVITY  PluginTag = "productivity"
	PLUGIN_TAG_EDUCATION     PluginTag = "education"
	PLUGIN_TAG_BUSINESS      PluginTag = "business"
	PLUGIN_TAG_ENTERTAINMENT PluginTag = "entertainment"
	PLUGIN_TAG_UTILITIES     PluginTag = "utilities"
	PLUGIN_TAG_AGENT         PluginTag = "agent"
	PLUGIN_TAG_OTHER         PluginTag = "other"
)

var validPluginTags = map[PluginTag]bool{
	PLUGIN_TAG_SEARCH:        true,
	PLUGIN_TAG_IMAGE:         true,
	PLUGIN_TAG_VIDEOS:        true,
	PLUGIN_TAG_WEATHER:       true,
	PLUGIN_TAG_FINANCE:       true,
	PLUGIN_TAG_DESIGN:        true,
	PLUGIN_TAG_TRAVEL:        true,
	PLUGIN_TAG_SOCIAL:        true,
	PLUGIN_TAG_NEWS:          true,
	PLUGIN_TAG_MEDICAL:       true,
	PLUGIN_TAG_PRODUCTIVITY:  true,
	PLUGIN_TAG_EDUCATION:     true,
	PLUGIN_TAG_BUSINESS:      true,
	PLUGIN_TAG_ENTERTAINMENT: true,
	PLUGIN_TAG_UTILITIES:     true,
	PLUGIN_TAG_AGENT:         true,
	PLUGIN_TAG_OTHER:         true,
}

func isPluginTag(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validPluginTags[PluginTag(value)]
}
