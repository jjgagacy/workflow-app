package main

import (
	"fmt"
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/server"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

func main() {
	fmt.Println("server starting")

	var config core.Config

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	err = envconfig.Process("", &config)
	if err != nil {
		log.Fatalf("Error processing environment: %s", err.Error())
	}

	config.SetDefault()

	if err = config.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %s", err.Error())
	}

	app := &server.App{}
	app.Run(&config)
}
