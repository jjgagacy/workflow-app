package media_transport

import (
	"path/filepath"

	"github.com/jjgagacy/workflow-app/plugin/oss"
)

type PackageBucket struct {
	oss         oss.OSS
	packagePath string
}

func NewPackageBucket(oss oss.OSS, packagePath string) *PackageBucket {
	return &PackageBucket{oss: oss, packagePath: packagePath}
}

func (m *PackageBucket) Save(name string, file []byte) error {
	filePath := filepath.Join(m.packagePath, name)

	return m.oss.Save(filePath, file)
}

func (m *PackageBucket) Get(name string) ([]byte, error) {
	return m.oss.Load(filepath.Join(m.packagePath, name))
}

func (m *PackageBucket) Delete(name string) error {
	return m.oss.Delete(filepath.Join(m.packagePath, name))
}
