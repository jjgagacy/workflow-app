package model

import "github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"

type TaskInstallStatus string

const (
	TaskInstallStatusPending TaskInstallStatus = "pending"
	TaskInstallStatusRunning TaskInstallStatus = "running"
	TaskInstallStatusSuccess TaskInstallStatus = "success"
	TaskInstallStatusFailed  TaskInstallStatus = "failed"
)

type TaskPluginInstallStatus struct {
	PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifier"`
	Label                  plugin_entities.I18nObject             `json:"label"`
	Icon                   string                                 `json:"icon"`
	IconDark               string                                 `json:"icon_dark"`
	PluginID               string                                 `json:"plugin_id"`
	Status                 TaskInstallStatus                      `json:"status"`
	Message                string                                 `json:"message"`
}

type TaskInstallation struct {
	Model
	Status           TaskInstallStatus         `gorm:"not null" json:"status"`
	TenantID         string                    `gorm:"type:uuid;not null" json:"tenant_id"`
	TotalPlugins     int                       `gorm:"not null" json:"total_plugins"`
	CompletedPlugins int                       `gorm:"not null" json:"completed_plugins"`
	Plugins          []TaskPluginInstallStatus `gorm:"serializer:json" json:"plugins"`
}
