package bundle_packager

import (
	"bytes"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/bundle_entities"
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

func (p *GenericBundlePackager) Manifest() (*bundle_entities.Bundle, error) {
	return p.bundle, nil
}
