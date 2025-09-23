package plugin_entities

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
)

type PluginCategory string

const (
	PLUGIN_CATEGORY_TOOL           PluginCategory = "tool"
	PLUGIN_CATEGORY_MODEL          PluginCategory = "model"
	PLUGIN_CATEGORY_EXTENSION      PluginCategory = "extension"
	PLUGIN_CATEGORY_AGENT_STRATEGY PluginCategory = "agent-strategy"
)

type PluginPermissionToolRequirement struct {
	Enabled bool `json:"enabled"`
}

type PluginPermissionModelRequirement struct {
	Enabled       bool `json:"enabled"`
	LLM           bool `json:"llm"`
	TextEmbedding bool `json:"text_embedding"`
	Rerank        bool `json:"rerank"`
	TTS           bool `json:"tts"`
	Speech2text   bool `json:"speech2text"`
	Moderation    bool `json:"moderation"`
}

type PluginPermissionNodeRequirement struct {
	Enabled bool `json:"enabled" yaml:"enabled"`
}

type PluginPermissionEndPointRequirement struct {
	Enabled bool `json:"enabled" yaml:"enabled"`
}

type PluginPermissionAppRequirement struct {
	Enabled bool `json:"enabled" yaml:"enabled"`
}

type PluginPermissionStorageRequirement struct {
	Enabled bool   `json:"enabled" yaml:"enabled"`
	Size    uint64 `json:"size" yaml:"size" validate:"min=1024,max=1073741824"` // min 1024 bytes, max 1G
}

type PluginPermissionRequirement struct {
	Tool     *PluginPermissionToolRequirement     `json:"tool,omitempty"`
	Model    *PluginPermissionModelRequirement    `json:"model,omitempty"`
	Node     *PluginPermissionNodeRequirement     `json:"node,omitempty"`
	EndPoint *PluginPermissionEndPointRequirement `json:"endpoint,omitempty"`
	App      *PluginPermissionAppRequirement      `json:"app,omitempty"`
	Storage  *PluginPermissionStorageRequirement  `json:"storage,omitempty"`
}

type PluginResourceRequirement struct {
	// Memory in bytes
	Memory int64 `json:"memory"`
	// Permission requirements
	Permission *PluginPermissionRequirement `json:"permission,omitempty"`
}

type PluginDeclarationFields struct {
	Version     manifest_entites.Version      `json:"version"`
	Type        manifest_entites.ManifestType `json:"type"`
	Author      string                        `json:"author"`
	Name        string                        `json:"name"`
	Label       I18nObject                    `json:"label"`
	Description I18nObject                    `json:"description"`
	Icon        string                        `json:"icon"`
	IconDark    string                        `json:"icon_dark"`
}

type PluginDeclaration struct {
	PluginDeclarationFields `yaml:",inline"`
	Verified                bool                              `json:"verified"`
	EndPoint                *EndPointProviderDeclaration      `json:"endpoint,omitempty"`
	Model                   *ModelProviderDeclaration         `json:"model,omitempty"`
	Tool                    *ToolProviderDeclaration          `json:"tool,omitempty"`
	AgentStrategy           *AgentStrategyProviderDeclaration `json:"agent_strategy,omitempty"`
}

func MarshalPluginID(author string, name string, version string) string {
	if author == "" {
		return fmt.Sprintf("%s:%s", name, version)
	}
	return fmt.Sprintf("%s/%s:%s", author, name, version)
}

func (p *PluginDeclaration) Identity() string {
	return MarshalPluginID(p.Author, p.Name, p.Version.String())
}
