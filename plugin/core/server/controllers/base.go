package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
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
