package bundle_entities

import (
	"encoding/json"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"gopkg.in/yaml.v3"
)

type Bundle struct {
	Name         string                        `json:"name" yaml:"name" validate:"required"`
	Labels       plugin_entities.I18nObject    `json:"labels" yaml:"labels" validate:"required"`
	Description  plugin_entities.I18nObject    `json:"description" yaml:"description" validate:"required"`
	Icon         string                        `json:"icon" yaml:"icon" validate:"required"`
	Version      manifest_entites.Version      `json:"version" yaml:"version" validate:"version,is_version"`
	Author       string                        `json:"author" yaml:"author" validate:"required"`
	Type         manifest_entites.ManifestType `json:"type" yaml:"type" validate:"required,eq=bundle"`
	Dependencies []Dependency                  `json:"dependencies" yaml:"dependencies" validate:"required"`
	Tags         []manifest_entites.PluginTag  `json:"tags" yaml:"tags" validate:"omitempty,dive,is_plugin_tag,max=128"`
}

func (b *Bundle) MarshalJSON() ([]byte, error) {
	type alias Bundle
	p := alias(*b)

	if p.Tags == nil {
		p.Tags = []manifest_entites.PluginTag{}
	}

	return json.Marshal(p)
}

func (b *Bundle) UnmarshalYAML(node *yaml.Node) error {
	type alias Bundle

	p := &struct {
		*alias `yaml:",inline"`
	}{
		alias: (*alias)(b),
	}

	if err := node.Decode(p); err != nil {
		return err
	}

	if p.Tags == nil {
		p.Tags = []manifest_entites.PluginTag{}
	}
	return nil
}
