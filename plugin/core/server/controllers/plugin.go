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
		pkgFileHeader, err := ctx.FormFile("pkg_file")
		if err != nil {
			ctx.JSON(http.StatusOK, entities.BadRequestError(err).ToResponse())
			return
		}

		tenantId := ctx.Param("tenant_id")
		if tenantId == "" {
			ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("tenant ID required")).ToResponse())
			return
		}

		if pkgFileHeader.Size > config.MaxPluginPackageSize {
			ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("filesize exceeds the maximum limit")).ToResponse())
			return
		}

		verifySignature := ctx.PostForm("verify_signature") == "true"

		pkgFile, err := pkgFileHeader.Open()
		if err != nil {
			ctx.JSON(http.StatusOK, entities.BadRequestError(err).ToResponse())
			return
		}
		defer pkgFile.Close()

		ctx.JSON(http.StatusOK, service.UploadPluginPkg(config, ctx, tenantId, pkgFile, verifySignature))
	}
}

func UploadBundle(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		bundleHeader, err := ctx.FormFile("bundle_file")
		if err != nil {
			ctx.JSON(http.StatusOK, entities.BadRequestError(err).ToResponse())
			return
		}

		tenantId := ctx.Param("tenant_id")
		if tenantId == "" {
			ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("tenant ID required")).ToResponse())
			return
		}

		if bundleHeader.Size > config.MaxBundlePackageSize {
			ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("filesize exceeds the maximum limit")).ToResponse())
			return
		}

		verifySignature := ctx.PostForm("verify_signature") == "true"

		bundleFile, err := bundleHeader.Open()
		if err != nil {
			ctx.JSON(http.StatusOK, entities.BadRequestError(err).ToResponse())
			return
		}
		defer bundleFile.Close()

		ctx.JSON(http.StatusOK, service.UploadPluginBundle(config, ctx, bundleFile, verifySignature))
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
			Metas                  []map[string]any                         `json:"meta" validate:"omitempty"`
		}) {
			if request.Metas == nil {
				request.Metas = []map[string]any{}
			}

			if len(request.Metas) != len(request.PluginUniqueIdentifier) {
				ctx.JSON(http.StatusOK, entities.BadRequestError(errors.New("the number of meta and plugin unique identifiers not match")).ToResponse())
				return
			}

			for i := range request.Metas {
				if request.Metas[i] == nil {
					request.Metas[i] = map[string]any{}
				}
			}

			ctx.JSON(http.StatusOK, service.InstallPluginFromIdentifier(
				config, request.TenantID, request.PluginUniqueIdentifier, request.Source, request.Metas,
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
