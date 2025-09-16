package model

type AgentStrategyInstallation struct {
	Model
	TenantID               string `gorm:"type:uuid;not null;index" json:"tenant_id"`
	Provider               string `gorm:"column:provider;size:127;index;not null" json:"provider"`
	PluginUniqueIdentifier string `gorm:"index;size:255" json:"plugin_unique_identifier"`
	PluginID               string `gorm:"index;size:255" json:"plugin_id"`
}
