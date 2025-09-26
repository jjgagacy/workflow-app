package plugin_entities

import (
	"fmt"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/constants"
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

type PluginExtensions struct {
	Tools           []string `json:"toosl" validate:"omitempty,dive,max=128"`
	Models          []string `json:"models" validate:"omitempty,dive,max=128"`
	EndPoints       []string `json:"end_points" validate:"omitempty,dive,max=128"`
	AgentStrategies []string `json:"agent_strategies" validate:"omitempty,dive,max=128"`
}

type PluginDeclarationBaseFields struct {
	Version     manifest_entites.Version      `json:"version" validate:"required,is_version"`
	Type        manifest_entites.ManifestType `json:"type" validate:"required,eq=plugin"`
	Author      string                        `json:"author" validate:"omitempty,max=64"`
	Name        string                        `json:"name" validate:"required,max=128"`
	Label       I18nObject                    `json:"label" validate:"required"`
	Description I18nObject                    `json:"description" validate:"required"`
	Icon        string                        `json:"icon" validate:"required,max=128"`
	IconDark    string                        `json:"icon_dark" validate:"omitempty,max=128"`
	Resource    PluginResourceRequirement     `json:"resource" validate:"required"`
	Plugins     PluginExtensions              `json:"plugins" validate:"required"`
	Meta        PluginMeta                    `json:"meta" validate:"required"`
	Tags        []manifest_entites.PluginTag  `json:"tags" validate:"omitempty,dive,is_plugin_tag,max=128"`
	CreatedAt   time.Time                     `json:"created" validate:"required"`
	Privacy     *string                       `json:"privary,omitempty" validate:"omitempty"`
	Repo        *string                       `json:"repo,omitempty" validate:"omitempty,url"`
}

type PluginDeclaration struct {
	PluginDeclarationBaseFields `yaml:",inline"`
	Verified                    bool                              `json:"verified"`
	EndPoint                    *EndPointProviderDeclaration      `json:"endpoint,omitempty"`
	Model                       *ModelProviderDeclaration         `json:"model,omitempty"`
	Tool                        *ToolProviderDeclaration          `json:"tool,omitempty"`
	AgentStrategy               *AgentStrategyProviderDeclaration `json:"agent_strategy,omitempty"`
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

type PluginRunner struct {
	Language   constants.Language `json:"language" validate:"required,is_languagengj76j8m9ikm9mk,9ygtytu6muio877gm tg  gttttttttttttttttttt tRY.5l,;h]=[ap3w;.2]"`
	Version    string             `json:"version"`
	EntryPoint string             `json:"entry_point"`
}

type PluginMeta struct {
	Version        string           `json:"version" validate:"required,version"`
	Arch           []constants.Arch `json:"arch" validate:"required,div,is_arch"`
	Runner         PluginRunner     `json:"runner" validate:"required"`
	MinimumVersion *string          `json:"minimum_version"`
}
