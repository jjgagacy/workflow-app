package bundle_packager

import "archive/zip"

type MemoryZipBunblePackager struct {
	GenericBundlePackager

	zipReader *zip.Reader
}

func NewMemoryZipBundlePackager(zipFile []byte) (*MemoryZipBunblePackager, error) {
	return nil, nil
}

func (p *MemoryZipBunblePackager) Save() error {
	return nil
}

func (p *MemoryZipBunblePackager) ReadFile(path string) ([]byte, error) {
	return nil, nil
}
