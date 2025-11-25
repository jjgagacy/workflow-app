package bundle_packager

import (
	"archive/zip"
	"bytes"
	"errors"
	"path/filepath"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/bundle_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type GenericBundlePackager struct {
	bundle *bundle_entities.Bundle
	assets map[string]*bytes.Buffer

	extra map[string]*bytes.Buffer
}

func NewGenericBundlePackager(
	bundle *bundle_entities.Bundle,
	extra map[string]*bytes.Buffer,
) *GenericBundlePackager {
	return &GenericBundlePackager{
		bundle: bundle,
		assets: make(map[string]*bytes.Buffer),
		extra:  extra,
	}
}

func (p *GenericBundlePackager) Export() ([]byte, error) {
	// build a new zip file
	buffer := bytes.NewBuffer(nil)
	zipWriter := zip.NewWriter(buffer)
	defer zipWriter.Close()

	// write the manifest file
	manifestFile, err := zipWriter.Create("manifest.yaml")
	if err != nil {
		return nil, err
	}

	manifestBytes := utils.MarshalYamlBytes(p.bundle)
	_, err = manifestFile.Write(manifestBytes)
	if err != nil {
		return nil, err
	}

	// Write the assets
	for name, asset := range p.assets {
		assetFile, err := zipWriter.Create(filepath.Join("_assets", name))
		if err != nil {
			return nil, err
		}

		_, err = assetFile.Write(asset.Bytes())
		if err != nil {
			return nil, err
		}
	}
	// Write the extra
	for name, file := range p.extra {
		extraFile, err := zipWriter.Create(name)
		if err != nil {
			return nil, err
		}

		_, err = extraFile.Write(file.Bytes())
		if err != nil {
			return nil, err
		}
	}

	// Close the zip file to flush the buffer
	err = zipWriter.Close()
	if err != nil {
		return nil, err
	}

	return buffer.Bytes(), nil
}

func (p *GenericBundlePackager) Manifest() (*bundle_entities.Bundle, error) {
	return p.bundle, nil
}

func (p *GenericBundlePackager) Regenerate(bundle bundle_entities.Bundle) error {
	// replace the basic information of the bundle
	p.bundle.Author = bundle.Author
	p.bundle.Description = bundle.Description
	p.bundle.Name = bundle.Name
	p.bundle.Labels = bundle.Labels
	return nil
}

func (p *GenericBundlePackager) AppendPackageDependency(packagePath string) error {
	// todo
	return nil
}

func (p *GenericBundlePackager) AppendMarketplaceDependency(packagePath string) error {
	// todo
	return nil
}

func (p *GenericBundlePackager) AppendGithubDependency(packagePath string) error {
	// todo
	return nil
}

func (p *GenericBundlePackager) ListDependencies() ([]bundle_entities.Dependency, error) {
	return p.bundle.Dependencies, nil
}

func (p *GenericBundlePackager) Remove(index int) error {
	if index < 0 || index >= len(p.bundle.Dependencies) {
		return errors.New("index out of bounds")
	}

	// get the dependency
	dependency := p.bundle.Dependencies[index]
	// remove the dependency
	p.bundle.Dependencies = append(p.bundle.Dependencies[:index], p.bundle.Dependencies[index+1:]...)
	// delete the assets
	depValue, ok := dependency.Value.(bundle_entities.PackageDependency)
	if ok {
		delete(p.assets, depValue.Path)
	}

	return nil
}

func (p *GenericBundlePackager) Assets() (map[string][]byte, error) {
	assets := make(map[string][]byte)
	for path, asset := range p.assets {
		assets[path] = asset.Bytes()
	}
	return assets, nil
}

func (p *GenericBundlePackager) FetchAsset(path string) ([]byte, error) {
	asset, ok := p.assets[path]
	if !ok {
		return nil, errors.New("asset not found")
	}
	return asset.Bytes(), nil
}

func (p *GenericBundlePackager) BumpVersion(target manifest_entites.Version) {
	p.bundle.Version = target
}
