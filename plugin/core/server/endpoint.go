package server

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
)

type EndPointHandler = func(ctx *gin.Context, hookId string, maxExecutionTime time.Duration, path string)

func (app *App) EndPoint(config *core.Config) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		hookId := ctx.Param("hook_id")
		path := ctx.Param("path")

		if !validatePath(path) {
			ctx.JSON(400, gin.H{"error": "Invalid Path"})
			return
		}

		// set X-Origin-Host
		if ctx.Request.Header.Get(endpoint_entities.HeaderXOriginalHost) == "" {
			ctx.Request.Header.Set(endpoint_entities.HeaderXOriginalHost, ctx.Request.Host)
		}

		if app.endPointHandler != nil {
			app.endPointHandler(ctx, hookId, time.Duration(config.PluginMaxExecutionTimeout)*time.Second, path)
		} else {
			app.EndPointHandler(ctx, hookId, time.Duration(config.PluginMaxExecutionTimeout)*time.Second, path)
		}
	}
}

func validatePath(path string) bool {
	if strings.Contains(path, "../") || strings.Contains(path, "~/") {
		return false
	}
	return true
}

func (app *App) EndPointHandler(ctx *gin.Context, hookId string, maxExecutionTime time.Duration, path string) {
	// todo
}
