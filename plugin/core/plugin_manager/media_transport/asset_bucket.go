package media_transport

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
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
	fullpath := filepath.Join(m.mediaPath, filename)

	err := m.oss.Save(fullpath, file)
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

	fullpath := filepath.Join(m.mediaPath, id)
	file, err := m.oss.Load(fullpath)
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
	remappedIds := make(map[string]string)
	assetsIds := []string{}
	remap := func(filename string) (string, error) {
		if id, ok := remappedIds[filename]; ok {
			return id, nil
		}

		file, ok := assets[filename]
		if !ok {
			return "", fmt.Errorf("file not found: %s", file)
		}

		id, err := m.Upload(filename, file)
		if err != nil {
			return "", err
		}

		assetsIds = append(assetsIds, id)

		remappedIds[filename] = id
		return id, nil
	}

	var err error
	if declaration.Model != nil {
		iconFields := []struct {
			icon      *plugin_entities.I18nObject
			iconType  string
			fieldName string
		}{
			{declaration.Model.IconSmall, "model icon small", ""},
			{declaration.Model.IconLarge, "model icon large", ""},
			{declaration.Model.IconSmallDark, "model icon small dark", ""},
			{declaration.Model.IconLargeDark, "model icon large dark", ""},
		}

		langFields := []struct {
			get    func(*plugin_entities.I18nObject) *string
			suffix string
		}{
			{func(i *plugin_entities.I18nObject) *string { return &i.EnUs }, "en_US"},
			{func(i *plugin_entities.I18nObject) *string { return &i.ZhHans }, "zh_Hans"},
		}

		for _, iconField := range iconFields {
			if iconField.icon == nil {
				continue
			}
			for _, langField := range langFields {
				ptr := langField.get(iconField.icon)
				if ptr != nil && *ptr != "" {
					*ptr, err = remap(*ptr)
					if err != nil {
						return nil, errors.Join(err, fmt.Errorf("failed to remap %s %s", iconField.iconType, langField.suffix))
					}
				}
			}
		}
	}

	if declaration.Tool != nil {
		if declaration.Tool.Identity.Icon != "" {
			declaration.Tool.Identity.Icon, err = remap(declaration.Tool.Identity.Icon)
			if err != nil {
				return nil, errors.Join(err, fmt.Errorf("failed to remap tool icon"))
			}
		}
		if declaration.Tool.Identity.IconDark != "" {
			declaration.Tool.Identity.IconDark, err = remap(declaration.Tool.Identity.IconDark)
			if err != nil {
				return nil, errors.Join(err, fmt.Errorf("failed to remap tool icon dark"))
			}
		}
	}

	if declaration.AgentStrategy != nil {
		if declaration.AgentStrategy.Identity.Icon != "" {
			declaration.AgentStrategy.Identity.Icon, err = remap(declaration.AgentStrategy.Identity.Icon)
			if err != nil {
				return nil, errors.Join(err, fmt.Errorf("failed to remap agent icon"))
			}
		}

		if declaration.AgentStrategy.Identity.IconDark != "" {
			declaration.AgentStrategy.Identity.IconDark, err = remap(declaration.AgentStrategy.Identity.IconDark)
			if err != nil {
				return nil, errors.Join(err, fmt.Errorf("failed to remap agent icon dark"))
			}
		}
	}

	if declaration.Icon != "" {
		declaration.Icon, err = remap(declaration.Icon)
		if err != nil {
			return nil, errors.Join(err, fmt.Errorf("failed to remap plugin icon"))
		}
	}
	if declaration.IconDark != "" {
		declaration.IconDark, err = remap(declaration.IconDark)
		if err != nil {
			return nil, errors.Join(err, fmt.Errorf("failed to remap plugin dark icon"))
		}
	}

	return assetsIds, nil
}
