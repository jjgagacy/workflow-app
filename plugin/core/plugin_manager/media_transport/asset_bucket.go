package media_transport

import (
	"crypto/sha256"
	"encoding/hex"
	"path/filepath"

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type MediaBucket struct {
	oss       oss.OSS
	cache     *lru.Cache[string, []byte]
	mediaPath string
}

func NewMediaBucket(oss oss.OSS, mediaPath string, cacheSize uint16) *MediaBucket {
	cache, _ := lru.New[string, []byte](int(cacheSize))
	return &MediaBucket{
		oss:       oss,
		cache:     cache,
		mediaPath: mediaPath,
	}
}

// Upload uploads a file to the media manager and returns an identifier
func (m *MediaBucket) Upload(name string, file []byte) (string, error) {
	// the same file and name will be overritten
	checksum := sha256.Sum256(append(file, []byte(name)...))
	id := hex.EncodeToString(checksum[:])
	ext := filepath.Ext(name)
	filename := id + ext
	filePath := filepath.Join(m.mediaPath, filename)

	err := m.oss.Save(filePath, file)
	if err != nil {
		return "", err
	}
	return filename, nil
}

func (m *MediaBucket) Get(id string) ([]byte, error) {
	data, ok := m.cache.Get(id)
	if ok {
		return data, nil
	}

	filePath := filepath.Join(m.mediaPath, id)
	file, err := m.oss.Load(filePath)
	if err != nil {
		return nil, err
	}

	m.cache.Add(id, file)

	return file, nil
}

func (m *MediaBucket) Delete(id string) error {
	m.cache.Remove(id)

	filePath := filepath.Join(m.mediaPath, id)
	return m.oss.Delete(filePath)
}

func (m *MediaBucket) RemapAssets(declaration *plugin_entities.PluginDeclaration, assets map[string][]byte) ([]string, error) {
	panic("")
}
