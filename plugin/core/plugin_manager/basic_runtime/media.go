package basic_runtime

import (
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager/media_transport"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type MediaTransport struct {
	mediaManager *media_transport.MediaBucket

	assetIds []string
}

// RemapAssets will take the assets and remap them to media id
func (r *MediaTransport) RemapAssets(
	declaration *plugin_entities.PluginDeclaration,
	assets map[string][]byte,
) error {
	panic("not impl")
}

func NewMediaTransport(mediaManager *media_transport.MediaBucket) MediaTransport {
	return MediaTransport{mediaManager: mediaManager}
}
