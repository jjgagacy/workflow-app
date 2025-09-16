package model

type TenantStorage struct {
	Model
	TenantID string `gorm:"column:tenant_id;type:varchar(255);not null;index" json:"tenant_id"`
	PluginID string `gorm:"column:plugin_id;type:varchar(255);not null;index" json:"plugin_id"`
	Size     int64  `gorm:"column:size;type:bigint;not null"`
}
