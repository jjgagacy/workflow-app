package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func ListTools(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		Page     int    `form:"page" validate:"required,min=1"`
		PageSize int    `form:"page_size" validate:"required,min=1,max=256"`
	}) {
		ctx.JSON(http.StatusOK, service.ListTools(request.TenantID, request.Page, request.PageSize))
	})
}

func GetTool(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		PluginID string `form:"plugin_id" validate:"required"`
		Provider string `form:"provider" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.GetTool(request.TenantID, request.PluginID, request.Provider))
	})
}

func CheckToolExistence(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID    string                              `uri:"tenant_id" validate:"required"`
		ProviderIDs []service.RequestCheckToolExistence `json:"provider_ids" validate:"required,dive"`
	}) {
		ctx.JSON(http.StatusOK, service.CheckToolExistence(request.TenantID, request.ProviderIDs))
	})
}
