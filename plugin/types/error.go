package types

import (
	"errors"

	"gorm.io/gorm"
)

var (
	ErrPluginAlreadyExists      = errors.New("plugin already exists")
	ErrPluginNotFound           = errors.New("plugin not found")
	ErrPluginInstallationExists = errors.New("plugin installation already exists")
	ErrPluginHasUninstalled     = errors.New("plugin has been uninstalled")
	ErrPluginNotInstalled       = errors.New("plugin is not installed")
)

var (
	ErrRecordNotFound = gorm.ErrRecordNotFound
)
