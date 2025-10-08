package plugin_entities

import (
	"fmt"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/constants"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
	"github.com/jjgagacy/workflow-app/plugin/utils"
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
	Enabled       bool `json:"enabled" yaml:"enabled,omitempty"`
	LLM           bool `json:"llm" yaml:"llm,omitempty"`
	TextEmbedding bool `json:"text_embedding" yaml:"text_embedding,omitempty"`
	Rerank        bool `json:"rerank" yaml:"rerank,omitempty"`
	TTS           bool `json:"tts" yaml:"tts,omitempty"`
	Speech2text   bool `json:"speech2text" yaml:"speech2text,omitempty"`
	Moderation    bool `json:"moderation" yaml:"moderation,omitempty"`
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
	Tool     *PluginPermissionToolRequirement     `json:"tool,omitempty" yaml:"tool,omitempty" `
	Model    *PluginPermissionModelRequirement    `json:"model,omitempty" yaml:"model,omitempty" `
	Node     *PluginPermissionNodeRequirement     `json:"node,omitempty" yaml:"node,omitempty" `
	EndPoint *PluginPermissionEndPointRequirement `json:"endpoint,omitempty" yaml:"endpoint,omitempty" `
	App      *PluginPermissionAppRequirement      `json:"app,omitempty" yaml:"app,omitempty" `
	Storage  *PluginPermissionStorageRequirement  `json:"storage,omitempty" yaml:"storage,omitempty" `
}

func (p *PluginPermissionRequirement) AllowRegisterEndPoint() bool {
	return p != nil && p.EndPoint != nil && p.EndPoint.Enabled
}

type PluginResourceRequirement struct {
	// Memory in bytes
	Memory int64 `json:"memory" yaml:"memory"`
	// Permission requirements
	Permission *PluginPermissionRequirement `json:"permission,omitempty" yaml:"permission,omitempty"`
}

type PluginExtensions struct {
	Tools           []string `json:"tools" validate:"omitempty,dive,max=128" yaml:"tools"`
	Models          []string `json:"models" validate:"omitempty,dive,max=128" yaml:"models"`
	EndPoints       []string `json:"endpoints" validate:"omitempty,dive,max=128" yaml:"endpoints"`
	AgentStrategies []string `json:"agent_strategies" validate:"omitempty,dive,max=128" yaml:"agent_strategies"`
}

type PluginDeclarationBaseFields struct {
	Version     manifest_entites.Version      `json:"version" validate:"required,is_version" yaml:"version"`
	Type        manifest_entites.ManifestType `json:"type" validate:"required,eq=plugin" yaml:"type"`
	Author      string                        `json:"author" validate:"omitempty,max=64" yaml:"author,omitempty"`
	Name        string                        `json:"name" validate:"required,max=128" yaml:"name"`
	Label       I18nObject                    `json:"label" validate:"required" yaml:"label"`
	Description I18nObject                    `json:"description" validate:"required" yaml:"description"`
	Icon        string                        `json:"icon" validate:"required,max=128" yaml:"icon"`
	IconDark    string                        `json:"icon_dark" validate:"omitempty,max=128" yaml:"icon_dark,omitempty"`
	Resource    PluginResourceRequirement     `json:"resource" validate:"required" yaml:"resource"`
	Plugins     PluginExtensions              `json:"plugins" validate:"required" yaml:"plugins"`
	Meta        PluginMeta                    `json:"meta" validate:"required" yaml:"meta"`
	Tags        []manifest_entites.PluginTag  `json:"tags" validate:"omitempty,dive,is_plugin_tag,max=128" yaml:"tags,omitempty"`
	CreatedAt   time.Time                     `json:"created" validate:"required" yaml:"created"`
	Privacy     *string                       `json:"privary,omitempty" validate:"omitempty" yaml:"privary,omitempty"`
	Repo        *string                       `json:"repo,omitempty" validate:"omitempty,url" yaml:"repo,omitempty"`
}

type PluginDeclaration struct {
	PluginDeclarationBaseFields `yaml:",inline"`
	Verified                    bool                              `json:"verified" yaml:"verified"`
	EndPoint                    *EndPointProviderDeclaration      `json:"endpoint,omitempty" yaml:"endpoint,omitempty"`
	Model                       *ModelProviderDeclaration         `json:"model,omitempty" yaml:"model,omitempty"`
	Tool                        *ToolProviderDeclaration          `json:"tool,omitempty" yaml:"tool,omitempty"`
	AgentStrategy               *AgentStrategyProviderDeclaration `json:"agent_strategy,omitempty" yaml:"agent_strategy,omitempty"`
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
	Language   constants.Language `json:"language" validate:"required,is_language" yaml:"language"`
	Version    string             `json:"version" yaml:"version"`
	EntryPoint string             `json:"entry_point" yaml:"entry_point"`
}

type PluginMeta struct {
	Version        string           `json:"version" validate:"required,is_version" yaml:"version"`
	Arch           []constants.Arch `json:"arch" validate:"required,dive,is_arch" yaml:"arch"`
	Runner         PluginRunner     `json:"runner" validate:"required" yaml:"runner"`
	MinimumVersion *string          `json:"minimum_version" yaml:"minimum_version,omitempty"`
}

func (p *PluginDeclaration) FillInDefaultValues() {
	if p.Tool != nil {
		if len(p.Tool.Identity.Tags) == 0 {
			p.Tool.Identity.Tags = p.Tags
		}
	}
	if p.Model != nil {
		if p.Model.Description == nil {
			descriptionCopy := p.Description
			p.Model.Description = &descriptionCopy
		}
	}
	if p.Tags == nil {
		p.Tags = []manifest_entites.PluginTag{}
	}
}

func UnmarshalPluginDeclarationFromYaml(b []byte) (*PluginDeclaration, error) {
	obj, err := utils.UnmarshalYamlBytes[PluginDeclaration](b)
	if err != nil {
		return nil, err
	}

	if err := validators.EntitiesValidator.Struct(obj); err != nil {
		return nil, err
	}

	obj.FillInDefaultValues()
	return &obj, nil
}
