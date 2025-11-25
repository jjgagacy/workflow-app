package bundle_packager

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/bundle_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
)

type BundlePackager interface {
	// Export exports the bundle to a zip byte array
	Export() ([]byte, error)
	// Save saves the bundle to the origin source
	Save() error
	// Manifest returns the manifest of bundle
	Manifest() (*bundle_entities.Bundle, error)
	// Remove removes a dependency from the bundle
	Remove(index int) error
	// AppendGithubDependency appends a github dependency
	AppendGithubDependency(pattern bundle_entities.GithubRepoPattern) error
	// AppendMarketplaceDependency appends a marketplace dependency
	AppendMarketplaceDependency(pattern bundle_entities.MarketplaceDependency) error
	// AppendPackageDependency appends a package dependency
	AppendPackageDependency(pattern string) error
	// ListDependencies lists all dependencies of the bundle
	ListDependencies() ([]bundle_entities.Dependency, error)
	// Regenerate regenerates the bundle, replace the basic information of the bundle
	Regenerate(bundle bundle_entities.Bundle) error
	// BumpVersion bumps the version of bundle
	BumpVersion(target manifest_entites.Version)
	// FetchAsset fetches the asset of bundle
	FetchAsset(path int) ([]byte, error)
	// Assets returns a set of assets in the bundle
	Assets() (map[string][]byte, error)
	// ReadFile reads the file from the bundle
	ReadFile(path string) ([]byte, error)
}
