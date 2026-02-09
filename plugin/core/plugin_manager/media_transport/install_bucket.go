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
	return b.oss.Save(filepath.Join(b.installedPath, pluginUniqueIdentifier.FsID()), file)
}

func (b *InstalledBucket) Exists(pluginFSEntity string) (bool, error) {
	return b.oss.Exists(filepath.Join(b.installedPath, pluginFSEntity))
}

func (b *InstalledBucket) Delete(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) error {
	return b.oss.Delete(filepath.Join(b.installedPath, pluginUniqueIdentifier.FsID()))
}

func (b *InstalledBucket) Get(pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier) ([]byte, error) {
	return b.oss.Load(filepath.Join(b.installedPath, pluginUniqueIdentifier.FsID()))
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
		author, name, version, err := plugin_entities.UnmarshalPluginFSID(strings.TrimPrefix(path.Path, b.installedPath))
		if err != nil {
			utils.Error("failed to unmarshal plugin: %s: %v", strings.TrimPrefix(path.Path, b.installedPath), err)
			continue
		}
		entity := plugin_entities.MarshalPluginID(author, name, version)
		identifier, err := plugin_entities.NewPluginUniqueIdentifier(entity)
		if err != nil {
			utils.Error("failed to create PluginUniqueIdentifier from the path %s: %v", path.Path, err)
			continue
		}
		identifiers = append(identifiers, identifier)
	}
	return identifiers, nil
}
