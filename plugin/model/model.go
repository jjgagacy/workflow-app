package model

type AIModelInstallation struct {
	Model
	Provider               string `gorm:"column:provider;size:127;index;not null" json:"provider"`
	TenantID               string `gorm:"column:tenant_id;type:uuid;index;not null" json:"tenant_id"`
	PluginUniqueIdentifier string `gorm:"index;size:255" json:"plugin_unique_identifier"`
	PluginID               string `gorm:"index;size:255" json:"plugin_id"`
}
