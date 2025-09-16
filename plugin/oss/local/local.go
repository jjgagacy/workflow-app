package local

import (
	"fmt"
	"os"

	"github.com/jjgagacy/workflow-app/plugin/oss"
)

type LocalStorage struct {
	root string
}

// Save implements oss.OSS.
func (l *LocalStorage) Save(key string, data []byte) error {
	panic("unimplemented")
}

// Delete implements oss.OSS.
func (l *LocalStorage) Delete(key string) error {
	panic("unimplemented")
}

// Exists implements oss.OSS.
func (l *LocalStorage) Exists(key string) (bool, error) {
	panic("unimplemented")
}

// List implements oss.OSS.
func (l *LocalStorage) List(prefix string) ([]oss.OSSPath, error) {
	panic("unimplemented")
}

// Load implements oss.OSS.
func (l *LocalStorage) Load(key string) ([]byte, error) {
	panic("unimplemented")
}

// State implements oss.OSS.
func (l *LocalStorage) State(key string) (oss.OSSState, error) {
	panic("unimplemented")
}

// Type implements oss.OSS.
func (l *LocalStorage) Type() string {
	panic("unimplemented")
}

func NewLocalStorage(args oss.Args) (oss.OSS, error) {
	if args.Local == nil {
		return nil, fmt.Errorf("cannot find Local storage argument")
	}
	err := args.Local.Validate()
	if err != nil {
		return nil, err
	}

	root := args.Local.Path
	if err := os.MkdirAll(root, 0755); err != nil {
		return nil, fmt.Errorf("failed to create storage path")
	}

	return &LocalStorage{root: root}, nil
}
