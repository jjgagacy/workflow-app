package server

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/server/server_const"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
)

func CheckKey(key string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// get header X-Api-Key
		if ctx.GetHeader(server_const.X_API_KEY) != key {
			ctx.AbortWithStatusJSON(401, entities.UnauthorizedError(errors.New("unauthorized")).ToResponse())
		}

		ctx.Next()
	}
}

func (app *App) FetchPluginInstallation() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pluginId := ctx.Request.Header.Get(server_const.X_PLUGIN_ID)
		if pluginId == "" {
			ctx.AbortWithStatusJSON(400, entities.BadRequestError(errors.New("plugin_id required")).ToResponse())
			return
		}

		tenantId := ctx.Param("tenant_id")
		if tenantId == "" {
			ctx.AbortWithStatusJSON(400, entities.BadRequestError(errors.New("tenant_id required")).ToResponse())
			return
		}

		// fetch plugin installation
		installation, err := db.GetOne[model.PluginInstallation](
			db.Equal("tenant_id", tenantId),
			db.Equal("plugin_id", pluginId),
		)
		if err == types.ErrRecordNotFound {
			ctx.AbortWithStatusJSON(400, entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse())
			return
		}
		if err != nil {
			ctx.AbortWithStatusJSON(500, entities.InternalError(err).ToResponse())
			return
		}

		identity, err := plugin_entities.NewPluginUniqueIdentifier(installation.PluginUniqueIdentifier)
		if err != nil {
			ctx.AbortWithStatusJSON(400, entities.UniqueIdentifierInvalidError(errors.New("identity error")).ToResponse())
			return
		}

		ctx.Set(server_const.PLUGIN_INSTALLATION, installation)
		ctx.Set(server_const.PLUGIN_UNIQUE_IDENTIFIER, identity)
		ctx.Next()
	}
}
