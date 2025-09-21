package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func GetAsset(ctx *gin.Context) {

}

func UploadPlugin(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func UploadBundle(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func UpgradePlugin(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func InstallPluginFromIdentifiers(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		BindRequest(ctx, func(request struct {
			TenantID               string                                   `url:"tenant_id" validate:"required"`
			PluginUniqueIdentifier []plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifies" validate:"required,max=64,dive,plugin_unique_identifier"`
			Source                 string                                   `json:"source" validate:"required"`
			Meta                   []map[string]any                         `json:"meta" validate:"omitempty"`
		}) {
			if request.Meta == nil {
				request.Meta = []map[string]any{}
			}

			if len(request.Meta) != len(request.PluginUniqueIdentifier) {
				ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("the number of meta and plugin unique identifiers not match")).ToResponse())
				return
			}

			for i := range request.Meta {
				if request.Meta[i] == nil {
					request.Meta[i] = map[string]any{}
				}
			}

			ctx.JSON(http.StatusOK, service.InstallPluginFromIdentifier(
				config, request.TenantID, request.PluginUniqueIdentifier, request.Source, request.Meta,
			))
		})
	}
}

func ReinstallPluginFromIdentifier(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}
func DecodePluginFromIdentifier(app *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func FetchPluginInstallationTasks(ctx *gin.Context) {

}
func FetchPluginInstallationTask(ctx *gin.Context) {

}
func DeletePluginInstallationTask(ctx *gin.Context) {

}

func DeleteAllPluginInstallationTasks(ctx *gin.Context) {

}

func DeletePluginInstallationItemFromTask(ctx *gin.Context) {

}

func FetchPluginManifest(ctx *gin.Context) {

}

func UninstallPlugin(ctx *gin.Context) {

}

func FetchPluginFromIdentifier(ctx *gin.Context) {

}

func ListPlugins(ctx *gin.Context) {

}

func BatchFetchPluginInstallationByIDs(ctx *gin.Context) {

}

func FetchMissingPluginInstallations(ctx *gin.Context) {

}
