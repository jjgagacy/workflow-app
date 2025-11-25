package bundle_packager

import (
	"os"
	"path/filepath"
)

type LocalBundlePackager struct {
	GenericBundlePackager

	path string
}

func NewLocalBundlePackager(path string) (BundlePackager, error) {
	return nil, nil
}

func (p *LocalBundlePackager) Save() error {
	return nil
}

func (p *LocalBundlePackager) ReadFile(path string) ([]byte, error) {
	return os.ReadFile(filepath.Join(p.path, path))
}
