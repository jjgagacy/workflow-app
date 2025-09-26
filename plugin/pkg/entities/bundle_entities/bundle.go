package bundle_entities

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type Bundle struct {
	Name         string                        `json:"name"`
	Labels       plugin_entities.I18nObject    `json:"labels"`
	Description  plugin_entities.I18nObject    `json:"description"`
	Icon         string                        `json:"icon"`
	Version      manifest_entites.Version      `json:"version"`
	Author       string                        `json:"author"`
	Type         manifest_entites.ManifestType `json:"type"`
	Dependencies []Dependency                  `json:"dependencies"`
	Tags         []manifest_entites.PluginTag  `json:"tags"`
}
