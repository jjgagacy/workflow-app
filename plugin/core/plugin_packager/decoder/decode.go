package decoder

import (
	"io"
	"io/fs"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type PluginDecoder interface {
	// Open initialize the decoder and prepares for use
	Open() error
	// Walk tranverse the plugin files
	Walk(fn func(filename string, dir string) error) error
	// ReadFile reads the entire contents of a file
	Readfile(filename string) ([]byte, error)
	// Readdir reads the contents of a directory
	ReadDir(dirname string) ([]string, error)
	// Close releases the resources by the decoder
	Close() error
	// State returns file info
	Stat(filename string) (fs.FileInfo, error)
	// FileReader returns an io.ReadCloser for reading
	FileReader(filename string) (io.ReadCloser, error)
	// Signature returns the signature of the plugin
	Signature() (string, error)
	// Verified returns true if the plugin is verified
	Verified() bool
	// CreateTime returns the creation time of the plugin
	CreateTime() (int64, error)
	// Manifest returns the manifest of the plugin
	Manifest() (plugin_entities.PluginDeclaration, error)
	// Assets returns a map of assets
	Assets() (map[string]string, error)
	// UniqueIdentify returns the unique identifier of the plugin
	UniqueIdentify() (plugin_entities.PluginUniqueIdentifier, error)
	// Checksum returns the checksum of the plugin
	Checksum() (string, error)
	// CheckAssetValid check assets valid
	CheckAssetValid() error
}
