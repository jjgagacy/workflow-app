package server

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
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

	// create manager
	manager := plugin_manager.InitGlobalManager(oss, config)
	// init manager
	manager.Launch(config)

	// start http server
	app.server(config)

	// block
	select {}
}
