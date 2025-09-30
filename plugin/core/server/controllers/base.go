package controllers

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/server/server_const"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

func BindRequest[T any](ctx *gin.Context, success func(T)) {
	var req T

	if ctx.Request.Header.Get("Content-Type") == "application/json" {
		ctx.ShouldBindJSON(&req)
	} else {
		ctx.ShouldBind(&req)
	}

	// bind uri
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(400, entities.BadRequestError(err).ToResponse())
		return
	}

	// validate
	if err := validators.EntitiesValidator.Struct(req); err != nil {
		ctx.JSON(400, entities.BadRequestError(err).ToResponse())
		return
	}

	success(req)
}

func BindPluginDispatchRequest[T any](rtx *gin.Context, success func(plugin_entities.InvokePluginRequest[T])) {
	BindRequest(rtx, func(req plugin_entities.InvokePluginRequest[T]) {
		uniqueIdentifier, exists := rtx.Get(server_const.PLUGIN_UNIQUE_IDENTIFIER)
		if !exists {
			rtx.JSON(400, entities.UniqueIdentifierInvalidError(errors.New("plugin unique identifier invalid")).ToResponse())
			return
		}

		pluginUniqueIdentifier, ok := uniqueIdentifier.(plugin_entities.PluginUniqueIdentifier)
		if !ok {
			rtx.JSON(400, entities.UniqueIdentifierInvalidError(errors.New("plugin unique identifier invalid")).ToResponse())
			return
		}

		req.UniqueIdentifier = pluginUniqueIdentifier

		success(req)
	})
}
