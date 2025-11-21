package persistence

import (
	"path"

	"github.com/jjgagacy/workflow-app/plugin/oss"
)

type wrapper struct {
	oss         oss.OSS
	storagePath string
}

func NewWrapper(oss oss.OSS, storagePath string) *wrapper {
	return &wrapper{
		oss:         oss,
		storagePath: storagePath,
	}
}

func (s *wrapper) getFilePath(tenantId string, pluginChecksum string, key string) string {
	key = path.Clean(key)
	return path.Join(s.storagePath, tenantId, pluginChecksum, key)
}

func (s *wrapper) Save(tenantId string, pluginChecksum string, key string, data []byte) error {
	filePath := s.getFilePath(tenantId, pluginChecksum, key)
	return s.oss.Save(filePath, data)
}

func (s *wrapper) Load(tenantId string, pluginChecksum string, key string) ([]byte, error) {
	filePath := s.getFilePath(tenantId, pluginChecksum, key)
	return s.oss.Load(filePath)
}

func (s *wrapper) Exists(tenantId string, pluginChecksum string, key string) (bool, error) {
	filePath := s.getFilePath(tenantId, pluginChecksum, key)
	return s.oss.Exists(filePath)
}

func (s *wrapper) Delete(tenantId string, pluginChecksum string, key string) error {
	filePath := s.getFilePath(tenantId, pluginChecksum, key)
	return s.oss.Delete(filePath)
}

func (s *wrapper) StateSize(tenantId string, pluginChecksum string, key string) (int64, error) {
	filePath := s.getFilePath(tenantId, pluginChecksum, key)
	state, err := s.oss.State(filePath)
	if err != nil {
		return 0, err
	}
	return state.Size, nil
}
