package server

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
)

func CheckKey(key string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// get header X-Api-Key
		if ctx.GetHeader(X_API_KEY) != key {
			ctx.AbortWithStatusJSON(401, entities.UnauthorizedError(errors.New("unauthorized")).ToResponse())
		}

		ctx.Next()
	}
}

func (app *App) FetchPluginInstallation() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}
