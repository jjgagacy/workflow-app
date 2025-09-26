package bundle_packager

import "archive/zip"

type MemoryZipBunblePackager struct {
	GenericBundlePackager

	zipReader *zip.Reader
}

func NewMemoryZipBundlePackager(zipFile []byte) (*MemoryZipBunblePackager, error) {
	panic("")
}
