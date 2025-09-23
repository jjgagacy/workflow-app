package decoder

import (
	"errors"
	"io"
	"io/fs"

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
	panic("")
}

func (d *FSPluginDecoder) Walk(fn func(filename string, dir string) error) error {
	panic("")
}

func (d *FSPluginDecoder) Readfile(filename string) ([]byte, error) {
	panic("")
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
	panic("")
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
