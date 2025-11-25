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

// Walk traverse the file system starting from the root directory and executes the provided
// function for each file found.
// It automatically reads and applies .gitignore rules if a .gitignore file is present.
//
// Notes:
//   - The root directory itself is not included in the walk.
//   - .gitignore patterns are parsed and applied if .gitignore file exists in the root.
//   - If a directory matches an ignore pattern, its entire subtree is skipped.
//   - The callback function is only called for files, not directories.
func (d *FSPluginDecoder) Walk(fn func(filename string, dir string) error) error {
	ignorePatterns := []gitignore.Pattern{}
	ignoreBytes, err := d.ReadFile(".gitignore")
	if err == nil {
		ignoreLines := strings.SplitSeq(string(ignoreBytes), "\n")
		for line := range ignoreLines {
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

// ReadDir reads the directory and returns relative file paths of all files.
// It tranverse the directory tree starting from the specified directory relative to the root.
// and collects all file paths (excluding directories) as relative paths from the root.
//
// Example:
// If the root is "/projects/app" and dirname is "src"
// it will tranverse "/projects/app/src" and returns paths like:
// "src/main.go", "src/utils/helper.go", etc.
func (d *FSPluginDecoder) ReadDir(dirname string) ([]string, error) {
	var files []string
	err := filepath.WalkDir(filepath.Join(d.root, dirname), func(path string, info fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			relPath, err := filepath.Rel(d.root, path)
			if err != nil {
				return err
			}
			files = append(files, relPath)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func (d *FSPluginDecoder) Close() error {
	return nil
}

func (d *FSPluginDecoder) Stat(filename string) (fs.FileInfo, error) {
	return os.Stat(filepath.Join(d.root, filename))
}

func (d *FSPluginDecoder) FileReader(filename string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(d.root, filename))
}

func (d *FSPluginDecoder) Signature() (string, error) {
	return "", nil
}

func (d *FSPluginDecoder) Verified() bool {
	return true
}

func (d *FSPluginDecoder) CreateTime() (int64, error) {
	return 0, nil
}

func (d *FSPluginDecoder) Manifest() (plugin_entities.PluginDeclaration, error) {
	return d.PluginDecoderHelper.Manifest(d)
}

func (d *FSPluginDecoder) Assets() (map[string][]byte, error) {
	return d.PluginDecoderHelper.Assets(d, string(filepath.Separator))
}

func (d *FSPluginDecoder) UniqueIdentity() (plugin_entities.PluginUniqueIdentifier, error) {
	return d.PluginDecoderHelper.UniqueIdentity(d)
}

func (d *FSPluginDecoder) Checksum() (string, error) {
	return d.PluginDecoderHelper.Checksum(d)
}

func (d *FSPluginDecoder) CheckAssetValid() error {
	return d.PluginDecoderHelper.CheckAssetsValid(d)
}

func (d *FSPluginDecoder) validateSignature(signature string) bool {
	// todo
	return true
}
