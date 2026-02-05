package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {
	pluginsDir := "~/Documents/codes/workflow-app/monie-plugins"
	outputBaseDir := "./storage/plugin"

	if strings.HasPrefix(pluginsDir, "~") {
		home, _ := os.UserHomeDir()
		pluginsDir = filepath.Join(home, pluginsDir[2:])
	}

	entries, err := os.ReadDir(pluginsDir)
	if err != nil {
		fmt.Printf("Error reading plugins directory: %v\n", err)
		os.Exit(-1)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		pluginName := entry.Name()
		pluginPath := filepath.Join(pluginsDir, pluginName)
		distPath := filepath.Join(pluginPath, "dist")
		outputPath := filepath.Join(outputBaseDir, pluginName)

		fmt.Printf("Processing plugin: %s\n", pluginName)
		fmt.Printf("  Plugin path: %s\n", pluginPath)
		fmt.Printf("  Dist path: %s\n", distPath)
		fmt.Printf("  Output path: %s\n", outputPath)

		packageJson := filepath.Join(pluginPath, "package.json")
		if _, err := os.Stat(packageJson); err == nil {
			fmt.Println("  Building with npm...")

			cmd := exec.Command("npm", "run", "build")
			cmd.Dir = pluginPath
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			if err := cmd.Run(); err != nil {
				fmt.Printf(" Error running npm build: %v\n", err)
				continue
			}
			fmt.Println("  npm build completed")
		} else {
			fmt.Println("  No package.json found, skipping npm build")
		}

		if _, err := os.Stat(distPath); os.IsNotExist(err) {
			fmt.Printf("  Dist directory does not exist: %s\n", distPath)
			continue
		}

		outputDir := filepath.Dir(outputPath)
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			fmt.Printf("  Error creating output directory: %v\n", err)
			continue
		}

		fmt.Println("  Packaging plugin...")
		cmd := exec.Command("go", "run", "cmd/main.go",
			"--output_path", outputPath,
			"plugin", "package", distPath)
		cmd.Dir = "."
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			fmt.Printf("  Error packaging plugin: %v\n", err)
			continue
		}

		fmt.Printf("  ✓ Plugin %s packaged successfully\n\n", pluginName)
	}
}
