package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func SetupEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
		TenantID               string                                 `uri:"tenant_id" validate:"required"`
		UserID                 string                                 `json:"user_id" validate:"required"`
		Settings               map[string]any                         `json:"settings" validate:"omitempty"`
		Name                   string                                 `json:"name" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.SetupEndPoint(
			request.TenantID,
			request.UserID,
			request.PluginUniqueIdentifier,
			request.Name,
			request.Settings,
		))
	})
}

func ListEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		Page     int    `form:"page" validate:"required"`
		PageSize int    `form:"page_size" validate:"required,max=100"`
	}) {
		ctx.JSON(http.StatusOK, service.ListEndPoints(request.TenantID, request.Page, request.PageSize))
	})
}

func ListPluginEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		PluginID string `form:"plugin_id" validate:"required"`
		Page     int    `form:"page" validate:"required"`
		PageSize int    `form:"page_size" validate:"required,max=100"`
	}) {
		ctx.JSON(http.StatusOK, service.ListPluginEndPoints(request.TenantID, request.PluginID, request.Page, request.PageSize))
	})
}

func RemoveEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID   string `uri:"tenant_id" validate:"required"`
		EndPointID string `json:"endpoint_id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.RemoveEndPoint(request.EndPointID, request.TenantID))
	})
}

func UpdateEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID   string         `uri:"tenant_id" validate:"required"`
		EndPointID string         `json:"endpoint_id" validate:"required"`
		UserID     string         `json:"user_id" validate:"required"`
		Settings   map[string]any `json:"settings" validate:"omitempty"`
		Name       string         `json:"name" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.UpdateEndPoint(request.EndPointID, request.TenantID, request.UserID, request.Name, request.Settings))
	})
}

func EnableEndPint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		EndPointID string `json:"endpoint_id" validate:"required"`
		TenantID   string `uri:"tenant_id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.SetEndPointEnable(request.EndPointID, request.TenantID))
	})
}

func DisableEndPoint(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		EndPointID string `json:"endpoint_id" validate:"required"`
		TenantID   string `uri:"tenant_id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.SetEndPointDisabled(request.EndPointID, request.TenantID))
	})
}
