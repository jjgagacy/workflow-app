package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func ListModels(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		Page     int    `form:"page" validate:"required,min=1"`
		PageSize int    `form:"page_size" validate:"required,min=1,max=256"`
	}) {
		ctx.JSON(http.StatusOK, service.ListModels(request.TenantID, request.Page, request.PageSize))
	})
}
