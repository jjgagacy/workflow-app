package bundle_entities

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"gopkg.in/yaml.v3"
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

func (b *Bundle) MarshalJSON() ([]byte, error) {
	panic("")
}

func (b *Bundle) UnmarshalYAML(node *yaml.Node) error {
	panic("")
}
