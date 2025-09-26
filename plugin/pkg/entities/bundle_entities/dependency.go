package bundle_entities

import "gopkg.in/yaml.v3"

type DependencyType string

const (
	DEPENDENCY_TYPE_GITHUB      DependencyType = "github"
	DEPENDENCY_TYPE_MARKETPLACE DependencyType = "marketplace"
	DEPENDENCY_TYPE_PACKAGE     DependencyType = "package"
)

type Dependency struct {
	Type  DependencyType `json:"type"`
	Value any            `json:"value"`
}

func (d *Dependency) UnmarshalYAML(node *yaml.Node) error {
	panic("")
}

type GithubRepoPattern string
type MarketplacePattern string

type GithubDependency struct {
}

type MarketplaceDependency struct {
}

type PackageDependency struct {
	Path string `json:"path" validate:"required"`
}
