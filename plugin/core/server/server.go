package server

import (
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
)

func (app *App) Run(config *core.Config) {
	// init database
	db.Init(config)

}
