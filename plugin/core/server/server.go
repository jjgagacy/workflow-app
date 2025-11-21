package server

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/persistence"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
)

func (app *App) Run(config *core.Config) {
	// logging
	app.setupLogging(config)
	defer app.closeLogging()
	// local sentry
	app.setupLocalSentry(config)
	// setup pool
	app.setupPool(config)
	// init database
	db.Init(config)
	// init oss
	oss := initOSS(config)
	// create manager
	manager := plugin_manager.InitGlobalManager(oss, config)
	// init manager
	manager.Launch(config)
	// init persistent
	persistence.InitPersistence(oss, config)
	// start http server
	app.server(config)
	log.Printf("server listening on 127.0.0.1:%d", config.ServerPort)
	// block
	select {}
}
