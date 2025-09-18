package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
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
