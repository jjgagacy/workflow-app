package server

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
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
		log.Panicf("failed to create storage: %s", err)
	}
	return storage
}
