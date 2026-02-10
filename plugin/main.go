package main

import (
	"fmt"
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/server"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func main() {
	fmt.Println("server starting")
	// hidden log online
	utils.SetLogVisibility(true)

	config, err := core.Load()
	if err != nil {
		log.Fatal(err)
	}

	app := &server.App{}
	app.Run(config)
}
