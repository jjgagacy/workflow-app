package bundle_packager

type ZipBundlePackager struct {
	*MemoryZipBunblePackager

	path string
}

func NewZipBundlePackager(path string) (BundlePackager, error) {
	return nil, nil
}

func NewZipBundlePackagerWithSizeLimit(path string, maxSize int64) (BundlePackager, error) {
	return nil, nil
}

func (p *ZipBundlePackager) Save() error {
	return nil
}
