package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
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
)

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "Config file (default is $HOME/.monie.yaml)")
	rootCmd.AddCommand(pluginCmd)
	pluginCmd.AddCommand(bundleCmd)
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
