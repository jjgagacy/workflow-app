package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func GetAsset(ctx *gin.Context) {
	manager := plugin_manager.Manager()
	asset, err := manager.GetAsset(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, entities.InternalError(err).ToResponse())
		return
	}

	ctx.Data(http.StatusOK, "application/octet-stream", asset)
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

		ctx.JSON(http.StatusOK, service.UploadPluginBundle(config, ctx, tenantId, bundleFile, verifySignature))
	}
}

func UpgradePlugin(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		BindRequest(ctx, func(request struct {
			TenantID                       string                                 `uri:"tenant_id" validate:"required"`
			OriginalPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"original_plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
			NewPluginUniqueIdentifier      plugin_entities.PluginUniqueIdentifier `json:"new_plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
			Source                         string                                 `json:"source" validate:"required"`
			Meta                           map[string]any                         `json"meta" validate:"omitempty"`
		}) {
			ctx.JSON(http.StatusOK, service.UpgradePlugin(
				config,
				request.TenantID,
				request.Source,
				request.Meta,
				request.OriginalPluginUniqueIdentifier,
				request.NewPluginUniqueIdentifier,
			))
		})
	}
}

func InstallPluginFromIdentifiers(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		BindRequest(ctx, func(request struct {
			TenantID               string                                   `uri:"tenant_id" validate:"required"`
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
func DecodePluginFromIdentifier(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		BindRequest(ctx, func(request struct {
			PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
		}) {
			ctx.JSON(http.StatusOK, service.DecodePluginFromIdentifier(config, request.PluginUniqueIdentifier))
		})
	}
}

func FetchPluginInstallationTasks(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		Page     int    `form:"page" validate:"required,min=1"`
		PageSize int    `form:"page_size" validate:"required,min=1,max=256"`
	}) {
		ctx.JSON(http.StatusOK, service.FetchPluginInstallationTasks(request.TenantID, request.Page, request.PageSize))
	})
}
func FetchPluginInstallationTask(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		TaskID   string `uri:"id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.FetchPluginInstallationTask(request.TenantID, request.TaskID))
	})
}
func DeletePluginInstallationTask(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
		TaskID   string `uri:"id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.DeletePluginInstallationTask(request.TenantID, request.TaskID))
	})
}

func DeleteAllPluginInstallationTasks(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID string `uri:"tenant_id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.DeleteAllPluginInstallationTasks(request.TenantID))
	})
}

func DeletePluginInstallationItemFromTask(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID   string `uri:"tenant_id" validate:"required"`
		TaskID     string `uri:"id" validate:"required"`
		Identifier string `uri:"identifier" validate:"required"`
	}) {
		identifierString := strings.TrimLeft(request.Identifier, "/")
		identifier, err := plugin_entities.NewPluginUniqueIdentifier(identifierString)
		if err != nil {
			ctx.JSON(http.StatusOK, entities.BadRequestError(err).ToResponse())
			return
		}

		ctx.JSON(http.StatusOK, service.DeletePluginInstallationItemFromTask(request.TenantID, request.TaskID, identifier))
	})
}

func FetchPluginManifest(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantId               string                                 `json:"tenant_id" validate:"required"`
		PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `form:"plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
	}) {
		ctx.JSON(http.StatusOK, service.FetchPluginManifest(request.PluginUniqueIdentifier))
	})
}

func UninstallPlugin(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantId             string `json:"tenant_id" validate:"required"`
		PluginInstallationID string `json:"plugin_installation_id" validate:"required"`
	}) {
		ctx.JSON(http.StatusOK, service.UninstallPlugin(request.TenantId, request.PluginInstallationID))
	})
}

func FetchPluginFromIdentifier(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `form:"plugin_unique_identifier" validate:"required,plugin_unique_identifier"`
	}) {
		ctx.JSON(http.StatusOK, service.FetchPluginFromIdentifier(request.PluginUniqueIdentifier))
	})
}

func ListPlugins(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantId string `uri:"tenant_id" validate:"required"`
		Page     int    `form:"page" validate:"required,min=1"`
		PageSize int    `form:"page_size" validate:"required,min=1,max=256"`
	}) {
		ctx.JSON(http.StatusOK, service.ListPlugins(request.TenantId, request.Page, request.PageSize))
	})
}

func BatchFetchPluginInstallationByIDs(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID  string   `json:"tenant_id" validate:"required"`
		PluginIDs []string `json:"plugin_ids" validate:"required,max=256"`
	}) {
		ctx.JSON(http.StatusOK, service.BatchFetchPluginInstallationByIDs(request.TenantID, request.PluginIDs))
	})
}

func FetchMissingPluginInstallations(ctx *gin.Context) {
	BindRequest(ctx, func(request struct {
		TenantID                string                                   `uri:"tenant_id" validate:"required"`
		PluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifiers" validate:"required,max=256,dive,plugin_unique_identifier"`
	}) {
		ctx.JSON(http.StatusOK, service.FetchMissingPluginInstallations(request.TenantID, request.PluginUniqueIdentifiers))
	})
}
