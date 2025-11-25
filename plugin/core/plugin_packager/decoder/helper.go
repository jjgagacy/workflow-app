package decoder

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

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

		pluginDec, err := utils.UnmarshalYamlBytes[plugin_entities.ToolProviderDeclaration](toolYaml)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal tool plugin file: %s", tool))
		}

		// read tools
		for _, toolFile := range pluginDec.ToolFiles {
			toolContent, err := decoder.ReadFile(toolFile)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read tool file: %s", toolFile))
			}

			toolFileDec, err := utils.UnmarshalYamlBytes[plugin_entities.ToolDeclaration](toolContent)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal tool file: %s", toolFile))
			}

			pluginDec.Tools = append(pluginDec.Tools, toolFileDec)
		}
		dec.Tool = &pluginDec
	}

	for _, endPoint := range plugins.EndPoints {
		endPointYaml, err := decoder.ReadFile(endPoint)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read endpoint file: %s", endPoint))
		}
		pluginDec, err := utils.UnmarshalYamlBytes[plugin_entities.EndPointProviderDeclaration](endPointYaml)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal endpoint file: %s", endPoint))
		}
		endPointFiles := pluginDec.EndPointFiles

		for _, endPointFile := range endPointFiles {
			endPointfileContent, err := decoder.ReadFile(endPointFile)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read endpoint file: %s", endPoint))
			}
			endPointDec, err := utils.UnmarshalYamlBytes[plugin_entities.EndPointDeclaration](endPointfileContent)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal endpoint file: %s", endPoint))
			}
			pluginDec.EndPoints = append(pluginDec.EndPoints, endPointDec)
		}
		dec.EndPoint = &pluginDec
	}

	for _, model := range plugins.Models {
		modelXml, err := decoder.ReadFile(model)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read model file: %s", modelXml))
		}

		modelDec, err := utils.UnmarshalYamlBytes[plugin_entities.ModelProviderDeclaration](modelXml)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal model file: %s", modelXml))
		}

		// read positions
		if modelDec.PositionFiles != nil {
			modelDec.Capability = &plugin_entities.ModelCapabilities{}

			llmFileName, ok := modelDec.PositionFiles["llm"]
			if ok {
				llmFile, err := decoder.ReadFile(llmFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read llm position file: %s", llmFileName))
				}

				position, err := utils.UnmarshalYamlBytes[[]string](llmFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal llm position file: %s", llmFileName))
				}

				modelDec.Capability.LLM = &position
			}

			textEmbeddingFileName, ok := modelDec.PositionFiles["text_embedding"]
			if ok {
				textEmbeddingFile, err := decoder.ReadFile(textEmbeddingFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read text embedding file: %s", textEmbeddingFile))
				}

				position, err := utils.UnmarshalYamlBytes[[]string](textEmbeddingFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal text embedding file: %s", textEmbeddingFile))
				}

				modelDec.Capability.TextEmbedding = &position
			}

			rerankFileName, ok := modelDec.PositionFiles["rerank"]
			if ok {
				rerankFile, err := decoder.ReadFile(rerankFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read rerank position file: %s", rerankFile))
				}

				position, err := utils.UnmarshalYamlBytes[[]string](rerankFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal rerank file: %s", rerankFile))
				}
				modelDec.Capability.Rerank = &position
			}

			ttsFileName, ok := modelDec.PositionFiles["tts"]
			if ok {
				ttsFile, err := decoder.ReadFile(ttsFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read tts position file: %s", ttsFile))
				}

				position, err := utils.UnmarshalYamlBytes[[]string](ttsFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal tts position file: %s", ttsFile))
				}

				modelDec.Capability.TTS = &position
			}

			speech2textFileName, ok := modelDec.PositionFiles["speech2text"]
			if ok {
				speech2textFile, err := decoder.ReadFile(speech2textFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read speech2text position file: %s", speech2textFile))
				}

				position, err := utils.UnmarshalYamlBytes[[]string](speech2textFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal speech2text position file: %s", speech2textFile))
				}

				modelDec.Capability.Speech2text = &position
			}

			moderationFileName, ok := modelDec.PositionFiles["moderation"]
			if ok {
				moderationFile, err := decoder.ReadFile(moderationFileName)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read moderation position file: %s", moderationFileName))
				}
				position, err := utils.UnmarshalYamlBytes[[]string](moderationFile)
				if err != nil {
					return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal moderation position file: %s", moderationFileName))
				}
				modelDec.Capability.Moderation = &position
			}
		}

		// read models
		if err := decoder.Walk(func(filename, dir string) error {
			modelPatterns := modelDec.ModelFiles
			// using glob to match if dir/filename is in models
			modelFileName := filepath.Join(dir, filename)
			if strings.HasSuffix(modelFileName, "_position.yaml") || strings.HasSuffix(modelFileName, "_provider.yaml") {
				return nil
			}

			for _, modelPattern := range modelPatterns {
				matched, err := filepath.Match(modelPattern, modelFileName)
				if err != nil {
					return err
				}
				if matched {
					// read model file
					modelFile, err := decoder.ReadFile(modelFileName)
					if err != nil {
						return err
					}
					plugin, err := utils.UnmarshalYamlBytes[plugin_entities.ModelDeclaration](modelFile)
					if err != nil {
						return err
					}
					modelDec.Models = append(modelDec.Models, plugin)
				}
			}
			return nil
		}); err != nil {
			return plugin_entities.PluginDeclaration{}, err
		}

		dec.Model = &modelDec
	}

	for _, agentStrategy := range plugins.AgentStrategies {
		agentStrategyYaml, err := decoder.ReadFile(agentStrategy)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read agent strategy file: %s", agentStrategyYaml))
		}
		agentStrategyDec, err := utils.UnmarshalYamlBytes[plugin_entities.AgentStrategyProviderDeclaration](agentStrategyYaml)
		if err != nil {
			return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal agent strategy file: %s", agentStrategyYaml))
		}
		for _, agentStrategyFile := range agentStrategyDec.StrategyFiles {
			strategyFileContent, err := decoder.ReadFile(agentStrategyFile)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to read agent strategy file: %s", agentStrategyFile))
			}

			strategyDec, err := utils.UnmarshalYamlBytes[plugin_entities.AgentStrategyDeclaration](strategyFileContent)
			if err != nil {
				return plugin_entities.PluginDeclaration{}, errors.Join(err, fmt.Errorf("failed to unmarshal agent strategy file: %s", agentStrategyFile))
			}

			agentStrategyDec.Strategies = append(agentStrategyDec.Strategies, strategyDec)
		}

		dec.AgentStrategy = &agentStrategyDec
	}

	dec.FillInDefaultValues()

	dec.Verified = p.verified(decoder)

	p.pluginDeclaration = &dec
	return dec, nil
}

func (p *PluginDecoderHelper) verified(decoder PluginDecoder) bool {
	// todo
	return true
}

func (p *PluginDecoderHelper) Assets(decoder PluginDecoder, separator string) (map[string][]byte, error) {
	files, err := decoder.ReadDir("_assets")
	if err != nil {
		return nil, err
	}

	assets := make(map[string][]byte)
	for _, file := range files {
		data, err := decoder.ReadFile(file)
		if err != nil {
			return nil, err
		}
		file := strings.TrimPrefix(file, "_assets"+separator)
		assets[file] = data
	}

	return assets, nil
}

func (p *PluginDecoderHelper) UniqueIdentity(decoder PluginDecoder) (plugin_entities.PluginUniqueIdentifier, error) {
	manifest, err := decoder.Manifest()
	if err != nil {
		return plugin_entities.PluginUniqueIdentifier(""), err
	}

	identity := manifest.Identity()
	checksum, err := decoder.Checksum()
	if err != nil {
		return plugin_entities.PluginUniqueIdentifier(""), err
	}
	return plugin_entities.PluginUniqueIdentifier(fmt.Sprintf("%s@%s", identity, checksum)), nil
}

func (p *PluginDecoderHelper) Checksum(decoder PluginDecoder) (string, error) {
	if p.checksum != "" {
		return p.checksum, nil
	}

	var err error
	p.checksum, err = CalculateChecksum(decoder)
	if err != nil {
		return "", err
	}

	return p.checksum, nil
}

func (p *PluginDecoderHelper) CheckAssetsValid(decoder PluginDecoder) error {
	_, err := decoder.Manifest()
	if err != nil {
		return errors.Join(err, fmt.Errorf("failed to get manifest"))
	}

	_, err = decoder.Assets()
	if err != nil {
		return errors.Join(err, fmt.Errorf("failed to get assets"))
	}

	return nil
}
