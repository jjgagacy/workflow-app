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
	group.Use(CheckKey(config.ServerKey))

	app.pluginDispatchGroup(group.Group("/dispatch"), config)
	app.pluginManagementGroup(group.Group("/management"), config)
	app.endPointManagementGroup(group.Group("/endpoint"))
	app.pluginAssetGroup(group.Group("/asset"))
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

func (app *App) pluginDispatchGroup(group *gin.RouterGroup, config *core.Config) {
	group.Use(controllers.CollectActiveDispatchRequests())
	group.Use(app.FetchPluginInstallation())

	app.setupDispatchGroup(group, config)
}

func (app *App) pluginManagementGroup(group *gin.RouterGroup, config *core.Config) {
	group.POST("/install/upload/package", controllers.UploadPlugin(config))
	group.POST("/install/upload/bundle", controllers.UploadBundle(config))
	group.POST("/install/identifiers", controllers.InstallPluginFromIdentifiers(config))
	group.POST("/install/upgrade", controllers.UpgradePlugin(config))
	group.GET("/decode/from_identifier", controllers.DecodePluginFromIdentifier(config))
	group.GET("/fetch/manifest", controllers.FetchPluginManifest)
	group.GET("/fetch/identifiers", controllers.FetchPluginFromIdentifier)
	group.POST("/uninstall", controllers.UninstallPlugin)
	group.GET("/list", controllers.ListPlugins)
	group.POST("/installation/fetch/batch", controllers.BatchFetchPluginInstallationByIDs)
	group.POST("/installation/missing", controllers.FetchMissingPluginInstallations)
	group.GET("/models", controllers.ListModels)
	group.GET("/tools", controllers.ListTools)
	group.GET("/tool", controllers.GetTool)
	group.POST("/tool/check_existence", controllers.CheckToolExistence)
	group.GET("/agent_strategies", controllers.ListAgentStrategies)
	group.GET("/agent_strategy", controllers.GetAgentStrategy)
	group.GET("/install/tasks/:id", controllers.FetchPluginInstallationTask)
	group.POST("/install/tasks/delete_all", controllers.DeleteAllPluginInstallationTasks)
	group.POST("/install/task/:id/delete", controllers.DeletePluginInstallationTask)
	group.POST("/install/tasks/:id/*identifier", controllers.DeletePluginInstallationItemFromTask)
	group.GET("/install/tasks", controllers.FetchPluginInstallationTasks)
}

func (app *App) endPointManagementGroup(group *gin.RouterGroup) {
	group.POST("/setup", controllers.SetupEndPoint)
	group.POST("/remove", controllers.RemoveEndPoint)
	group.POST("/update", controllers.UpdateEndPoint)
	group.POST("/enable", controllers.EnableEndPint)
	group.POST("/disable", controllers.DisableEndPoint)
	group.GET("/list", controllers.ListEndPoint)
	group.GET("/list/plugin", controllers.ListPluginEndPoints)
}

func (app *App) pluginAssetGroup(group *gin.RouterGroup) {
	group.GET("/:id", controllers.GetAsset)
}

func (app *App) setupDispatchGroup(group *gin.RouterGroup, config *core.Config) {
	group.POST("/tool/invoke", controllers.InvokeTool(config))
	group.POST("/tool/validate_credentials", controllers.ValidateToolCredentials(config))
	group.POST("/tool/get_runtime_parameters", controllers.GetToolRuntimeParameters(config))
	group.POST("/llm/invoke", controllers.InvokeLLM(config))
	group.POST("/llm/num_tokens", controllers.GetLLMNumTokens(config))
	group.POST("/text_embedding/invoke", controllers.InvokeTextEmbedding(config))
	group.POST("/text_embedding/num_tokens", controllers.GetTextEmbeddingNumTokens(config))
	group.POST("/rerank/invoke", controllers.InvokeRerank(config))
	group.POST("/tts/invoke", controllers.InvokeTTS(config))
	group.POST("/tts/model/voices", controllers.GetTTSModelVoices(config))
	group.POST("/speech2text/invoke", controllers.InvokeSpeech2Text(config))
	group.POST("/moderation/invoke", controllers.InvokeModeration(config))
	group.POST("/model/validate_provider_credentials", controllers.ValidateProviderCredentials(config))
	group.POST("/model/validate_model_credentials", controllers.ValidateModelCredentials(config))
	group.POST("/model/schema", controllers.GetAIModelSchema(config))
	group.POST("/oauth/get_authorization_url", controllers.GetAuthorizationURL(config))
	group.POST("/oauth/get_credentials", controllers.GetCredentials(config))
	group.POST("/oauth/refresh_credentials", controllers.RefreshCredentials(config))
	group.POST("/dynamic_select/fetch_parameter_options", controllers.FetchDynamicParameterOptions(config))
}
