package server

import (
	"errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/service"
	"github.com/jjgagacy/workflow-app/plugin/types"
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
	endPoint, err := db.GetOne[model.EndPoint](
		db.Equal("hook_id", hookId),
	)
	if err == types.ErrRecordNotFound {
		ctx.JSON(404, entities.BadRequestError(errors.New("endpoint not found")).ToResponse())
		return
	}
	if err != nil {
		ctx.JSON(404, entities.InternalError(errors.New("internal server error")).ToResponse())
		return
	}
	// get plugin installation
	pluginInstallation, err := db.GetOne[model.PluginInstallation](
		db.Equal("plugin_id", endPoint.PluginID),
		db.Equal("tenant_id", endPoint.TenantID),
	)
	if err != nil {
		ctx.JSON(404, gin.H{"error": "Plugin installation not found"})
		return
	}
	_, err = plugin_entities.NewPluginUniqueIdentifier(pluginInstallation.PluginUniqueIdentifier)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Invalid plugin unique identifier"})
		return
	}
	// service
	service.EndPoint(ctx, &endPoint, &pluginInstallation, maxExecutionTime, path)
}
