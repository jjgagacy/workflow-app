package server

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/server/controllers"
)

func (app *App) server(config *core.Config) func() {
	engine := gin.New()

	if *config.HealthApiLogEnabled {
		engine.Use(gin.Logger())
	} else {
		engine.Use(gin.LoggerWithConfig(gin.LoggerConfig{
			SkipPaths: []string{"/health/check"},
		}))
	}
	engine.Use(gin.Recovery())
	engine.Use(controllers.CollectActiveRequests())
	engine.GET("/health/check", controllers.HealthCheck(config))

	endPointGroup := engine.Group("/endpoint")
	pluginGroup := engine.Group("/plugin/:tenant_id")

	app.endPointGroup(endPointGroup, config)
	app.pluginGroup(pluginGroup, config)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.ServerPort),
		Handler: engine,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Panicf("Listen: %s", err)
		}
	}()

	return func() {
		if err := srv.Shutdown(context.Background()); err != nil {
			log.Panicf("Server shutdown: %s\n", err)
		}
	}
}

func (app *App) pluginGroup(group *gin.RouterGroup, config *core.Config) {

}

func (app *App) endPointGroup(group *gin.RouterGroup, config *core.Config) {
	if config.PluginEndPointEnabled != nil && *config.PluginEndPointEnabled {
		group.HEAD("/:hook_id/*path", app.EndPoint(config))
		group.POST("/:hook_id/*path", app.EndPoint(config))
		group.GET("/:hook_id/*path", app.EndPoint(config))
		group.PUT("/:hook_id/*path", app.EndPoint(config))
		group.DELETE("/:hook_id/*path", app.EndPoint(config))
		group.OPTIONS("/:hook_id/*path", app.EndPoint(config))
	}
}
