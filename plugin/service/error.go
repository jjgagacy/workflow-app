package service

import (
	"errors"

	"gorm.io/gorm"
)

var (
	ErrPluginAlreadyExists      = errors.New("plugin already exists")
	ErrPluginNotFound           = errors.New("plugin not found")
	ErrPluginInstallationExists = errors.New("plugin installation already exists")
)

var (
	ErrRecordNotFound = gorm.ErrRecordNotFound
)
