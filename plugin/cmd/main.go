package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/cmd/plugin"
	"github.com/jjgagacy/workflow-app/plugin/cmd/run"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/joho/godotenv"

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

	pluginClearCwd = &cobra.Command{
		Use:   "clear cwd",
		Short: "Clear plugin daemon cwd all plugins",
		Long:  `Clear the current working directory of the plugin daemon for all plugins.`,
		Run: func(cmd *cobra.Command, args []string) {
			if err := clearPluginWorkingPath(); err != nil {
				fmt.Fprintf(os.Stderr, "clear cwd failed: %v\n", err)
				os.Exit(1)
			}
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

	pluginSyncPackageCacheCmd = &cobra.Command{
		Use:   "sync-packages [plugins_dir] [package_root]",
		Short: "Sync local monie-plugins into the package cache directory",
		Long:  `Package every plugin found under monie-plugins and copy the output into the package bucket directory using author/name:version as the path`,
		Args:  cobra.MaximumNArgs(2),
		Run: func(cmd *cobra.Command, args []string) {
			pluginsDir := "../monie-plugins"
			packageRoot := os.Getenv("PLUGIN_PACKAGE_CACHE_PATH")
			if packageRoot == "" {
				packageRoot = "./storage/plugin_packages"
			}

			if len(args) >= 1 {
				pluginsDir = args[0]
			}
			if len(args) == 2 {
				packageRoot = args[1]
			}

			pluginsDir = expandHomeDir(pluginsDir)
			packageRoot = expandHomeDir(packageRoot)

			if err := syncMoniePluginsToPackageBucket(pluginsDir, packageRoot); err != nil {
				fmt.Fprintf(os.Stderr, "sync package cache failed: %v\n", err)
				os.Exit(1)
			}
		},
	}

	pluginDeclarationCmd = &cobra.Command{
		Use:   "declaration [add|update|delete] [plugin_name|all] [plugins_dir]",
		Short: "Manage PluginDeclaration records from local monie-plugins",
		Long:  `Synchronize PluginDeclaration records from the monie-plugins directory. Use plugin_name or all to target a specific plugin or every plugin.`,
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			action := strings.ToLower(args[0])
			targetName := "all"
			pluginsDir := "../monie-plugins"

			if len(args) >= 2 {
				targetName = args[1]
			}
			if len(args) >= 3 {
				pluginsDir = args[2]
			}

			pluginsDir = expandHomeDir(pluginsDir)
			if err := ensureDeclarationDB(); err != nil {
				fmt.Fprintf(os.Stderr, "init db failed: %v\n", err)
				os.Exit(1)
			}
			defer db.Close()

			if err := syncPluginDeclarations(action, pluginsDir, targetName); err != nil {
				fmt.Fprintf(os.Stderr, "declaration %s failed: %v\n", action, err)
				os.Exit(1)
			}
		},
	}

	// bundle plugin save to
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

type pluginManifest struct {
	Name    string `yaml:"name"`
	Author  string `yaml:"author"`
	Version string `yaml:"version"`
}

func loadManifest(manifestPath string) (*pluginManifest, error) {
	data, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, err
	}

	m, err := utils.UnmarshalYaml[pluginManifest](string(data))
	if err != nil {
		return nil, err
	}

	if m.Name == "" || m.Version == "" {
		return nil, fmt.Errorf("invalid manifest: name/version required")
	}
	return &m, nil
}

func expandHomeDir(path string) string {
	if strings.HasPrefix(path, "~") {
		home, err := os.UserHomeDir()
		if err == nil {
			return filepath.Join(home, path[2:])
		}
	}
	return path
}

func packageCachePathForPluginUniqueIdentifier(packageRoot, identifier string) string {
	return filepath.Join(packageRoot, identifier)
}

func ensureDeclarationDB() error {
	cfg, err := core.Load()
	if err != nil {
		return err
	}
	db.Init(cfg)
	return nil
}

func loadPluginDeclarationForPath(pluginPath string) (*plugin_entities.PluginDeclaration, plugin_entities.PluginUniqueIdentifier, error) {
	decoder, err := decoder.NewFSPluginDecoder(pluginPath)
	if err != nil {
		return nil, "", fmt.Errorf("create fs decoder for %s: %w", pluginPath, err)
	}
	declaration, err := decoder.Manifest()
	if err != nil {
		return nil, "", fmt.Errorf("manifest for %s: %w", pluginPath, err)
	}
	uniqueIdentifier, err := decoder.UniqueIdentity()
	if err != nil {
		return nil, "", fmt.Errorf("unique identity for %s: %w", pluginPath, err)
	}

	return &declaration, uniqueIdentifier, nil
}

func syncPluginDeclarations(action, pluginsDir, targetName string) error {
	entries, err := os.ReadDir(pluginsDir)
	if err != nil {
		return fmt.Errorf("read plugins directory %q: %w", pluginsDir, err)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		pluginPath := filepath.Join(pluginsDir, entry.Name(), "dist")
		if targetName != "all" && entry.Name() != targetName {
			continue
		}

		declaration, uniqueIdentifier, err := loadPluginDeclarationForPath(pluginPath)
		if err != nil {
			fmt.Printf("Skipping %s: %v\n", pluginPath, err)
			continue
		}

		switch action {
		case "add":
			if _, err := db.GetOne[model.PluginDeclaration](
				db.Equal("plugin_unique_identifier", uniqueIdentifier.BaseName()),
			); err == nil {
				fmt.Printf("plugin declaration already exists: %s\n", uniqueIdentifier.BaseName())
				continue
			}
			if err != nil && err != types.ErrRecordNotFound {
				fmt.Printf("query existing declaration for %s failed: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}

			if err := db.Create(&model.PluginDeclaration{
				PluginUniqueIdentifier: uniqueIdentifier.BaseName(),
				PluginID:               uniqueIdentifier.PluginID(),
				Declaration:            *declaration,
			}); err != nil {
				fmt.Printf("create declaration for %s failed: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}
			fmt.Printf("Added declaration %s\n", uniqueIdentifier.BaseName())
		case "update":
			record, err := db.GetOne[model.PluginDeclaration](
				db.Equal("plugin_unique_identifier", uniqueIdentifier.BaseName()),
			)
			if err != nil {
				fmt.Printf("plugin declaration not found for update: %s: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}
			record.PluginID = uniqueIdentifier.PluginID()
			record.Declaration = *declaration
			if err := db.Update(&record); err != nil {
				fmt.Printf("update declaration for %s failed: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}
			fmt.Printf("Updated declaration %s\n", uniqueIdentifier.BaseName())
		case "delete":
			record, err := db.GetOne[model.PluginDeclaration](
				db.Equal("plugin_unique_identifier", uniqueIdentifier.BaseName()),
			)
			if err != nil {
				fmt.Printf("plugin declaration not found for delete: %s: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}

			pluginRecord, err := db.GetOne[model.Plugin](
				db.Equal("plugin_unique_identifier", uniqueIdentifier.BaseName()),
			)
			if err == nil && pluginRecord.Refers != 0 {
				fmt.Printf("cannot delete declaration %s because plugin refers=%d\n", uniqueIdentifier.BaseName(), pluginRecord.Refers)
				continue
			} else if err != nil && err != types.ErrRecordNotFound {
				fmt.Printf("query plugin record for %s failed: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}

			if err := db.Delete(&record); err != nil {
				fmt.Printf("delete declaration for %s failed: %v\n", uniqueIdentifier.BaseName(), err)
				continue
			}
			fmt.Printf("Deleted declaration %s\n", uniqueIdentifier.BaseName())
		default:
			fmt.Printf("unsupported action %q, use add|update|delete\n", action)
			continue
		}
	}

	return nil
}

func syncMoniePluginsToPackageBucket(pluginsDir, packageRoot string) error {
	entries, err := os.ReadDir(pluginsDir)
	if err != nil {
		return fmt.Errorf("read plugins directory %q: %w", pluginsDir, err)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		pluginPath := filepath.Join(pluginsDir, entry.Name())
		manifestPath := filepath.Join(pluginPath, "manifest.yaml")
		manifest, err := loadManifest(manifestPath)
		if err != nil {
			fmt.Printf("Skipping %s: %v\n", pluginPath, err)
			continue
		}

		if manifest.Author == "" {
			fmt.Printf("Skipping %s: author is empty in manifest\n", pluginPath)
			continue
		}

		uniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(
			plugin_entities.MarshalPluginID(manifest.Author, manifest.Name, manifest.Version),
		)
		if err != nil {
			fmt.Printf("Skipping %s: invalid plugin unique identifier: %v\n", pluginPath, err)
			continue
		}

		distPath := filepath.Join(pluginPath, "dist")
		if _, err := os.Stat(distPath); err != nil {
			fmt.Printf("Skipping %s: dist directory not found: %v\n", pluginPath, err)
			continue
		}

		tmpFile, err := os.CreateTemp("", "monie-plugin-*.moniepkg")
		if err != nil {
			return fmt.Errorf("create temp package file for %s: %w", pluginPath, err)
		}
		tmpPath := tmpFile.Name()
		_ = tmpFile.Close()

		plugin.PackagePlugin(distPath, tmpPath)
		if _, err := os.Stat(tmpPath); err != nil {
			_ = os.Remove(tmpPath)
			return fmt.Errorf("package plugin %s failed: %w", pluginPath, err)
		}

		data, err := os.ReadFile(tmpPath)
		if err != nil {
			_ = os.Remove(tmpPath)
			return fmt.Errorf("read packaged plugin %s: %w", pluginPath, err)
		}
		_ = os.Remove(tmpPath)

		targetPath := packageCachePathForPluginUniqueIdentifier(packageRoot, uniqueIdentifier.String())
		if err := os.MkdirAll(filepath.Dir(targetPath), 0o755); err != nil {
			return fmt.Errorf("create package dir for %s: %w", uniqueIdentifier.String(), err)
		}
		if err := os.WriteFile(targetPath, data, 0o644); err != nil {
			return fmt.Errorf("save plugin package %s: %w", uniqueIdentifier.String(), err)
		}

		fmt.Printf("Synced %s -> %s\n", uniqueIdentifier.String(), targetPath)
	}

	return nil
}

func clearPluginWorkingPath() error {
	if err := godotenv.Load(); err != nil {
		if !os.IsNotExist(err) {
			return fmt.Errorf("load .env failed: %w", err)
		}
	}

	workingPath := viper.GetString("PLUGIN_WORKING_PATH")
	if workingPath == "" {
		workingPath = os.Getenv("PLUGIN_WORKING_PATH")
	}
	if workingPath == "" {
		workingPath = "./cwd"
	}

	absPath, err := filepath.Abs(workingPath)
	if err != nil {
		return fmt.Errorf("resolve plugin working path %q: %w", workingPath, err)
	}

	cleanedPath := filepath.Clean(absPath)
	if cleanedPath == "." || cleanedPath == string(filepath.Separator) || cleanedPath == "" {
		return fmt.Errorf("refusing to clear unsafe working path %q", workingPath)
	}

	if err := os.RemoveAll(cleanedPath); err != nil {
		return fmt.Errorf("remove plugin working path %q failed: %w", cleanedPath, err)
	}
	if err := os.MkdirAll(cleanedPath, 0o755); err != nil {
		return fmt.Errorf("recreate plugin working path %q failed: %w", cleanedPath, err)
	}

	fmt.Printf("Cleared plugin working directory: %s\n", cleanedPath)
	return nil
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
	pluginCmd.AddCommand(pluginSyncPackageCacheCmd)
	pluginCmd.AddCommand(pluginDeclarationCmd)

	runCmd.Flags().StringVarP(&runMode, "mode", "m", "stdio", "run mode, stdio or tcp")
	runCmd.Flags().BoolVarP(&runPluginPayload.EnableLogs, "enable-logs", "l", false, "enable logs")
	runCmd.Flags().BoolVarP(&runPluginPayload.ZipFilePlugin, "zip-file", "z", false, "plugin file is zip")
	runCmd.Flags().StringVarP(&runPluginPayload.ResponseFormat, "response-format", "r", "text", "response format, text or json")

	rootCmd.AddCommand(pluginCmd)
	pluginCmd.AddCommand(bundleCmd)
	pluginCmd.AddCommand(pluginInitCmd)
	pluginCmd.AddCommand(pluginClearCwd)
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
