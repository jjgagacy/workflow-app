package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/jjgagacy/workflow-app/plugin/cmd/plugin"
	"github.com/jjgagacy/workflow-app/plugin/cmd/run"
	"github.com/jjgagacy/workflow-app/plugin/utils"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	author      string
	name        string
	repo        string
	description string
	storageSize uint64
	category    string
	language    string

	allowRegisterEndpoint    bool
	allowInvokeTool          bool
	allowInvokeModel         bool
	allowInvokeLLM           bool
	allowInvokeTextEmbedding bool
	allowInvokeRerank        bool
	allowInvokeTTS           bool
	allowInvokeSpeech2Text   bool
	allowInvokeModeration    bool
	allowInvokeNode          bool
	allowInvokeApp           bool
	allowUseStorage          bool

	quick bool
)

var (
	configFile string

	rootCmd = &cobra.Command{
		Use:   "monie",
		Short: "monie",
		Long:  "Monie is a workflow application.",
	}

	pluginCmd = &cobra.Command{
		Use:   "plugin",
		Short: "plugin",
		Long:  "Plugin commands",
	}

	bundleCmd = &cobra.Command{
		Use:   "bundle",
		Short: "bundle",
		Long:  "Bundle commands",
	}

	pluginInitCmd = &cobra.Command{
		Use:   "init",
		Short: "Initialize a new plugin",
		Long: `Initialize a new plugin with the given parameters.
If no parameter are provided, an interactive mode will be started.`,
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("plugin init command executed")
		},
	}

	pluginPackageCmd = &cobra.Command{
		Use:   "package [package_path]",
		Short: "Package a plugin",
		Long:  `Package a plugin into a distributable format.`,
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			inputPath := filepath.Clean(args[0])
			outputPath := ""

			if cmd.Flag("output_path").Value.String() != "" {
				outputPath = cmd.Flag("output_path").Value.String()
			} else {
				base := filepath.Base(inputPath)
				if base == "." || base == "/" {
					fmt.Println("Error: invalid input path, you should specify the path outside of plugin directory")
					return
				}
				outputPath = base + ".moniepkg"
			}

			plugin.PackagePlugin(inputPath, outputPath)
		},
	}
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

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}

func init() {
	utils.SetLogVisibility(true)

	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "Config file (default is $HOME/.monie.yaml)")

	pluginInitCmd.Flags().StringVar(&author, "author", "", "Author name (1-64 characters, lowercase letters, numbers, dashes and underscores only)")
	pluginInitCmd.Flags().StringVar(&name, "name", "", "Plugin name (1-128 characters, lowercase letters, numbers, dashes and underscores only)")
	pluginInitCmd.Flags().StringVar(&description, "description", "", "Plugin description (cannot be empty)")
	pluginInitCmd.Flags().StringVar(&repo, "repo", "", "Plugin repository URL (optional)")
	pluginInitCmd.Flags().BoolVar(&allowRegisterEndpoint, "allow-endpoint", false, "Allow the plugin to register endpoints")
	pluginInitCmd.Flags().BoolVar(&allowInvokeTool, "allow-tool", false, "Allow the plugin to invoke tools")
	pluginInitCmd.Flags().BoolVar(&allowInvokeModel, "allow-model", false, "Allow the plugin to invoke models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeLLM, "allow-llm", false, "Allow the plugin to invoke LLM models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeTextEmbedding, "allow-text-embedding", false, "Allow the plugin to invoke text embedding models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeRerank, "allow-rerank", false, "Allow the plugin to invoke rerank models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeTTS, "allow-tts", false, "Allow the plugin to invoke TTS models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeSpeech2Text, "allow-speech2text", false, "Allow the plugin to invoke speech to text models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeModeration, "allow-moderation", false, "Allow the plugin to invoke moderation models")
	pluginInitCmd.Flags().BoolVar(&allowInvokeNode, "allow-node", false, "Allow the plugin to invoke nodes")
	pluginInitCmd.Flags().BoolVar(&allowInvokeApp, "allow-app", false, "Allow the plugin to invoke apps")
	pluginInitCmd.Flags().BoolVar(&allowUseStorage, "allow-storage", false, "Allow the plugin to use storage")
	pluginInitCmd.Flags().Uint64Var(&storageSize, "storage-size", 0, "Maximum storage size in bytes")
	pluginInitCmd.Flags().StringVar(&category, "category", "", `Plugin category. Available options:
  - tool: Tool plugin
  - llm: Large Language Model plugin
  - text-embedding: Text embedding plugin
  - speech2text: Speech to text plugin
  - moderation: Content moderation plugin
  - rerank: Rerank plugin
  - tts: Text to speech plugin
  - extension: Extension plugin
  - agent-strategy: Agent strategy plugin`)
	pluginInitCmd.Flags().StringVar(&language, "language", "", `Programming language. Available options:
  - python: Python language`)
	pluginInitCmd.Flags().BoolVar(&quick, "quick", false, "Skip interactive mode and create plugin directly")

	pluginPackageCmd.Flags().StringP("output_path", "o", "", "output path")

	runCmd.Flags().StringVarP(&runMode, "mode", "m", "stdio", "run mode, stdio or tcp")
	runCmd.Flags().BoolVarP(&runPluginPayload.EnableLogs, "enable-logs", "l", false, "enable logs")
	runCmd.Flags().BoolVarP(&runPluginPayload.ZipFilePlugin, "zip-file", "z", false, "plugin file is zip")
	runCmd.Flags().StringVarP(&runPluginPayload.ResponseFormat, "response-format", "r", "text", "response format, text or json")

	rootCmd.AddCommand(pluginCmd)
	pluginCmd.AddCommand(bundleCmd)
	pluginCmd.AddCommand(pluginInitCmd)
	pluginCmd.AddCommand(pluginPackageCmd)
	pluginCmd.AddCommand(runCmd)
}

func initConfig() {
	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		viper.AddConfigPath(home)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".monie")
	}

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
}
