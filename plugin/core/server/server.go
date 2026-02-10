package server

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/persistence"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
)

func (app *App) Init(config *core.Config) (shutdowns []func(), err error) {
	// logging
	app.setupLogging(config)
	shutdowns = append(shutdowns, app.closeLogging)

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

	return shutdowns, nil
}

func (app *App) Run(config *core.Config) {
	shutdowns, err := app.Init(config)
	if err != nil {
		log.Fatal(err)
	}

	app.BuildEngine(config)
	shutdown := app.startHttpServer(config)
	log.Printf("server listening on 127.0.0.1:%d", config.ServerPort)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit

	log.Println("Shutting down server...")

	shutdown()
	for _, s := range shutdowns {
		s()
	}

	log.Println("Server gracefully stopped")
}
