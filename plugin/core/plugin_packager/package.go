package plugin_packager

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
)

type Packager struct {
	decoder  decoder.PluginDecoder
	manifest string
}

func NewPackager(decoder decoder.PluginDecoder) *Packager {
	return &Packager{
		decoder:  decoder,
		manifest: "manifest.yaml",
	}
}

type FileInfoPath struct {
	Path string
	Size int64
}

func (p *Packager) Pack(maxSize int64) ([]byte, error) {
	err := p.Validate()

	zipBuffer := new(bytes.Buffer)
	zipWriter := zip.NewWriter(zipBuffer)

	totalSize := int64(0)

	var files []FileInfoPath

	err = p.decoder.Walk(func(filename, dir string) error {
		fullPath := filepath.Join(dir, filename)
		file, err := p.decoder.ReadFile(fullPath)
		if err != nil {
			return err
		}
		fileSize := len(file)
		files = append(files, FileInfoPath{Path: fullPath, Size: int64(fileSize)})
		totalSize += int64(fileSize)
		if totalSize > maxSize {
			sort.Slice(files, func(i, j int) bool {
				return files[i].Size > files[j].Size
			})
			fileTopInfo := ""
			top := 5
			if len(files) < 5 {
				top = len(files)
			}
			for i := 0; i < top; i++ {
				fileTopInfo += fmt.Sprintf("%d. name: %s, size: %d bytes\n", i+1, files[i].Path, files[i].Size)
			}
			errMsg := fmt.Sprintf("Plugin package size is too large. Please ensure the uncompressed size is less than %d bytes.\nPackaged file info:\n%s", maxSize, fileTopInfo)
			return errors.New(errMsg)
		}

		fullPath = strings.ReplaceAll(fullPath, "\\", "/")

		zipFile, err := zipWriter.Create(fullPath)
		if err != nil {
			return err
		}

		_, err = zipFile.Write(file)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	err = zipWriter.Close()
	if err != nil {
		return nil, err
	}

	return zipBuffer.Bytes(), nil
}
