package server

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/manager"
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/oss/factory"
)

func initOSS(config *core.Config) oss.OSS {
	var storage oss.OSS
	var err error

	storage, err = factory.Load(config.PluginStorageType, oss.Args{
		Local: &oss.Local{
			Path: config.PluginStorageLocalRoot,
		},
	})

	if err != nil {
		log.Panic("Failed to create storage: %s", err)
	}

	return storage
}

func (app *App) Run(config *core.Config) {
	// init database
	db.Init(config)

	oss := initOSS(config)

	manager := manager.InitGlobalManager(oss, config)

	manager.Launch(config)

	// start http server
	app.server(config)

	// block
	select {}
}
