package decoder

import (
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5/plumbing/format/gitignore"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

var (
	ErrNotDir = errors.New("not a directory")
)

type FSPluginDecoder struct {
	PluginDecoder
	PluginDecoderHelper

	root string
	fs   fs.FS
}

func NewFSPluginDecoder(root string) (*FSPluginDecoder, error) {
	decoder := &FSPluginDecoder{
		root: root,
	}

	err := decoder.Open()
	if err != nil {
		return nil, err
	}

	// read the manifest
	if _, err := decoder.Manifest(); err != nil {
		return nil, err
	}

	return decoder, nil
}

func (d *FSPluginDecoder) Open() error {
	d.fs = os.DirFS(d.root)

	st, err := os.Stat(d.root)
	if err != nil {
		return err
	}

	if !st.IsDir() {
		return ErrNotDir
	}

	return nil
}

func (d *FSPluginDecoder) Walk(fn func(filename string, dir string) error) error {
	ignorePatterns := []gitignore.Pattern{}
	ignoreBytes, err := d.ReadFile(".gitignore")
	if err == nil {
		ignoreLines := strings.Split(string(ignoreBytes), "\n")
		for _, line := range ignoreLines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			ignorePatterns = append(ignorePatterns, gitignore.ParsePattern(line, nil))
		}
	}

	return filepath.WalkDir(d.root, func(path string, info fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// get relative path from root
		relPath, err := filepath.Rel(d.root, path)
		if err != nil {
			return err
		}

		// skip root directory
		if relPath == "." {
			return nil
		}

		// check if path matches any ignore pattern
		pathParts := strings.Split(relPath, string(filepath.Separator))
		for _, pattern := range ignorePatterns {
			if result := pattern.Match(pathParts, info.IsDir()); result == gitignore.Exclude {
				if info.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
		}

		dir := filepath.Dir(relPath)
		if dir == "." {
			dir = ""
		}

		if info.IsDir() {
			return nil
		}

		return fn(info.Name(), dir)
	})
}

func (d *FSPluginDecoder) ReadFile(filename string) ([]byte, error) {
	return os.ReadFile(filepath.Join(d.root, filename))
}

func (d *FSPluginDecoder) ReadDir(dirname string) ([]string, error) {
	panic("")
}

func (d *FSPluginDecoder) Close() error {
	panic("")
}

func (d *FSPluginDecoder) Stat(filename string) (fs.FileInfo, error) {

	panic("")
}

func (d *FSPluginDecoder) FileReader(filename string) (io.ReadCloser, error) {
	panic("")
}

func (d *FSPluginDecoder) Signature() (string, error) {
	panic("")
}

func (d *FSPluginDecoder) Verified() bool {
	panic("")
}

func (d *FSPluginDecoder) CreateTime() (int64, error) {
	panic("")
}

func (d *FSPluginDecoder) Manifest() (plugin_entities.PluginDeclaration, error) {
	return d.PluginDecoderHelper.Manifest(d)
}

func (d *FSPluginDecoder) Assets() (map[string]string, error) {
	panic("")
}

func (d *FSPluginDecoder) UniqueIdentify() (plugin_entities.PluginUniqueIdentifier, error) {
	panic("")
}

func (d *FSPluginDecoder) Checksum() (string, error) {
	panic("")
}

func (d *FSPluginDecoder) CheckAssetValid() error {

	panic("")
}

func (d *FSPluginDecoder) validateSignature(signature string) bool {
	panic("")
}
