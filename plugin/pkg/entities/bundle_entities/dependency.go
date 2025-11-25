package bundle_entities

import "gopkg.in/yaml.v3"

type DependencyType string

const (
	DEPENDENCY_TYPE_GITHUB      DependencyType = "github"
	DEPENDENCY_TYPE_MARKETPLACE DependencyType = "marketplace"
	DEPENDENCY_TYPE_PACKAGE     DependencyType = "package"
)

type GithubRepoPattern string
type MarketplacePattern string

type Dependency struct {
	Type  DependencyType `json:"type"`
	Value any            `json:"value"`
}

type GithubDependency struct {
	RepoPattern GithubRepoPattern `json:"repo_pattern" yaml:"repo_pattern" validate:"required"`
}

type MarketplaceDependency struct {
	MarketplacePattern MarketplacePattern `json:"marketplace_pattern" yaml:"marketplace_pattern" validate:"required"`
}

type PackageDependency struct {
	Path string `json:"path" yaml:"path" validate:"required"`
}

func (d *Dependency) UnmarshalYAML(node *yaml.Node) error {
	type alias struct {
		Type  DependencyType `json:"type" yaml:"type" validate:"required,oneof=github marketplace package"`
		Value yaml.Node      `json:"value" yaml:"value" validate:"required"`
	}

	var a alias
	if err := node.Decode(&a); err != nil {
		return err
	}

	d.Type = a.Type

	switch d.Type {
	case DEPENDENCY_TYPE_GITHUB:
		var value GithubDependency
		if err := a.Value.Decode(&value); err != nil {
			return err
		}
		d.Value = value
	case DEPENDENCY_TYPE_MARKETPLACE:
		var value MarketplaceDependency
		if err := a.Value.Decode(&value); err != nil {
			return err
		}
		d.Value = value
	case DEPENDENCY_TYPE_PACKAGE:
		var value PackageDependency
		if err := a.Value.Decode(&value); err != nil {
			return err
		}
		d.Value = value
	}
	return nil
}
