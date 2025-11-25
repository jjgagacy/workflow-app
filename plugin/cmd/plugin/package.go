package plugin

import (
	"os"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	MaxPluginPackageSize = int64(50 * 1024 * 1024) // 50MB
)

func PackagePlugin(inputPath string, outputPath string) {
	decoder, err := decoder.NewFSPluginDecoder(inputPath)
	if err != nil {
		utils.Error("failed to create plugin decoder, plugin path: %s, error: %v", inputPath, err)
		os.Exit(-1)
		return
	}

	packager := plugin_packager.NewPackager(decoder)
	zipFile, err := packager.Pack(MaxPluginPackageSize)

	if err != nil {
		utils.Error("failed to package plugin: %v", err)
		os.Exit(-1)
		return
	}

	err = os.WriteFile(outputPath, zipFile, 0644)
	if err != nil {
		utils.Error("failed to write package file $v", err)
		os.Exit(-1)
		return
	}

	utils.Info("plugin packaged successfully, output path: %s", outputPath)
}
