package media_transport

import (
	"path/filepath"
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type InstalledBucket struct {
	oss           oss.OSS
	installedPath string
}

func NewInstalledBucket(oss oss.OSS, installedPath string) *InstalledBucket {
	return &InstalledBucket{oss: oss, installedPath: installedPath}
}

func (b *InstalledBucket) Save(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	file []byte,
) error {
	return b.oss.Save(filepath.Join(b.installedPath, string(pluginUniqueIdentifier)), file)
}

func (b *InstalledBucket) Exists(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) (bool, error) {
	return b.oss.Exists(filepath.Join(b.installedPath, string(pluginUniqueIdentifier)))
}

func (b *InstalledBucket) Delete(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) error {
	return b.oss.Delete(filepath.Join(b.installedPath, string(pluginUniqueIdentifier)))
}

func (b *InstalledBucket) Get(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) ([]byte, error) {
	return b.oss.Load(filepath.Join(b.installedPath, string(pluginUniqueIdentifier)))
}

func (b *InstalledBucket) List() ([]plugin_entities.PluginUniqueIdentifier, error) {
	paths, err := b.oss.List(b.installedPath)
	if err != nil {
		return nil, err
	}
	identifiers := make([]plugin_entities.PluginUniqueIdentifier, 0)
	for _, path := range paths {
		if path.IsDir {
			continue
		}
		// skip hidden
		if strings.HasPrefix(path.Path, ".") {
			continue
		}
		// remove prefix
		identifier, err := plugin_entities.NewPluginUniqueIdentifier(
			strings.TrimPrefix(path.Path, b.installedPath),
		)
		if err != nil {
			utils.Error("failed to create PluginUniqueIdentifier from the path %s: %v", path.Path, err)
			continue
		}
		identifiers = append(identifiers, identifier)
	}
	return identifiers, nil
}
