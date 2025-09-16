package model

type PluginInstallationStatus string

type PluginInstallation struct {
	Model
	TenantID               string         `gorm:"index;type:uuid;" json:"tenant_id"`
	PluginID               string         `gorm:"index;size:255" json:"plugin_id"`
	PluginUniqueIdentifier string         `gorm:"index;size:255" json:"plugin_unique_identifier"`
	RuntimeType            string         `gorm:"size:127" json:"runtime_type"`
	EndPointSetups         int            `json:"end_point_setups"`
	EndPointStatus         int            `json:"end_point_status"`
	Source                 string         `gorm:"column:source;size:63" json:"source"`
	Meta                   map[string]any `gorm:"column:meta;serializer:json" json:"meta"`
}
