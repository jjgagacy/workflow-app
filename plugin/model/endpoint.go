package model

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entites"
)

// HookID is a pointer to plugin id and tenant id, using it to identify the endpoint plugin
type EndPoint struct {
	Model
	Name        string                                      `gorm:"column:name;size:127;default:'default'" json:"name"`
	HookID      string                                      `gorm:"column:hook_id;size:127;unique" json:"hook_id"`
	TenantID    string                                      `gorm:"column:tenant_id;size:64;index" json:"tenant_id"`
	UserID      string                                      `gorm:"column:user_id;size:64;index" json:"user_id"`
	PluginID    string                                      `gorm:"column:plugin_id;size:64;index" json:"plugin_id"`
	ExpireAt    time.Time                                   `gorm:"column:expired_at" json:"expired_at"`
	Enabled     bool                                        `gorm:"column:enabled" json:"enabled"`
	Settings    map[string]any                              `gorm:"column:settings;serializer:json" json:"settings"`
	Declaration *plugin_entites.EndPointProviderDeclaration `gorm:"-" json:"declaration"` // not stored in db
}
