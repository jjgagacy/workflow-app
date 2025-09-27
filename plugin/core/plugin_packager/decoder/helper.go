package decoder

import (
	"errors"
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type PluginDecoderHelper struct {
	pluginDeclaration *plugin_entities.PluginDeclaration
	checksum          string

	verifiedFlag *bool
}

func (p *PluginDecoderHelper) Manifest(decoder PluginDecoder) (plugin_entities.PluginDeclaration, error) {
	if p.pluginDeclaration != nil {
		return *p.pluginDeclaration, nil
	}

	// read the manifest file
	manifest, err := decoder.ReadFile("manifest.yaml")
	if err != nil {
		return plugin_entities.PluginDeclaration{}, err
	}

	dec, err := utils.UnmarshalYamlBytes[plugin_entities.PluginDeclaration](manifest)
	if err != nil {
		return plugin_entities.PluginDeclaration{}, err
	}
	plugins := dec.Plugins
	for _, tool := range plugins.Tools {
		toolYaml, err := decoder.ReadFile(tool)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read tool file: %s", tool))
		}

		toolProviderDeclaration, err := utils.UnmarshalYamlBytes[plugin_entities.ToolProviderDeclaration](toolYaml)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal tool plugin file: %s", tool))
		}

		// read tools
		for _, toolFile := range toolProviderDeclaration.ToolFiles {
			toolContent, err := decoder.ReadFile(toolFile)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read tool file: %s", toolFile))
			}

			toolFileDec, err := utils.UnmarshalYamlBytes[plugin_entities.ToolDeclaration](toolContent)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal tool file: %s", toolFile))
			}

			toolProviderDeclaration.Tools = append(toolProviderDeclaration.Tools, toolFileDec)
		}
	}

}
