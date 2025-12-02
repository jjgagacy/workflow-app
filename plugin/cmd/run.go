package main

import (
	"github.com/jjgagacy/workflow-app/plugin/cmd/run"
	"github.com/spf13/cobra"
)

var (
	runCmd = &cobra.Command{
		Use:   "run [plugin_package_path]",
		Short: "run",
		Long:  "Launch a plugin locally and communicate through stdin/stdout or TCP",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			runPluginPayload.RunMode = run.RunMode(runMode)
			run.RunPlugin(runPluginPayload)
		},
	}
	runPluginPayload run.RunPluginPayload
	runMode          string
)

func init() {
	pluginCmd.AddCommand(runCmd)

	runCmd.Flags().StringVarP(&runMode, "mode", "m", "stdio", "run mode, stdio or tcp")
	runCmd.Flags().BoolVarP(&runPluginPayload.EnableLogs, "enable-logs", "l", false, "enable logs")
	runCmd.Flags().BoolVarP(&runPluginPayload.ZipFilePlugin, "zip-file", "l", false, "plugin file is zip")
	runCmd.Flags().StringVarP(&runPluginPayload.ResponseFormat, "response-format", "r", "text", "response format, text or json")
}
