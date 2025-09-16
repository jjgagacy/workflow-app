package model

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entites"
)

type Plugin struct {
	Model
	PluginUniqueIdentifier string                           `gorm:"index;size:255" json:"plugin_unique_identifier"`
	PluginID               string                           `gorm:"index;size:255" json:"id"`
	Refers                 int                              `gorm:"default:0" json:"refers"`
	InstallType            plugin_entites.PluginRuntimeType `gorm:"size:127;index" json:"install_type"`
	ManifestType           manifest_entites.ManifestType    `gorm:"size:127" json:"manifest_type"`
	RemoteDeclaration      plugin_entites.PluginDeclaration `gorm:"serializer:json;type:text;size:65535"`
}

type PluginDeclaration struct {
	Model
	PluginUniqueIdentifier string                           `json:"plugin_unique_identifier" gorm:"size:255;unique"`
	PluginID               string                           `json:"plugin_id" gorm:"size:255;index"`
	Declaration            plugin_entites.PluginDeclaration `gorm:"serializer:json;type:text;size:65535" json:"declaration"`
}
