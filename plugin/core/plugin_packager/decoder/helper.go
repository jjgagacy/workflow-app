package decoder

import "github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"

type PluginDecoderHelper struct {
	pluginDeclaration *plugin_entities.PluginDeclaration
	checksum          string

	verifiedFlag *bool
}
