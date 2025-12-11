import { PluginConfig } from "@/config/config";
import { PluginDeclaration } from "@/core/entities/plugin/declaration";
import { loadYamlFile } from "@/utils/yaml.util";
import path from "path";
import * as fs from 'fs';
import { ToolConfiguration } from "@/core/entities/plugin/tool";
import { ToolProviderConfiguration } from "@/core/entities/plugin/provider";

export class PluginRegistry {
  declaration!: PluginDeclaration;
  toolProviderConfigurations: ToolProviderConfiguration[] = [];
  toolConfigurations: ToolConfiguration[] = [];

  constructor(private config: PluginConfig) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadPluginConfiguration();
      await this.loadPluginAssets();
    } catch (error) {
      throw new Error(`Failed to initialize plugin: ${error}`);
    }
  }

  async loadManifestLog() {
    const manifestPath = path.resolve(process.cwd(), 'manifest.yaml');
    console.log('Current working directory: ', process.cwd());
    console.log('Looking for manifest at: ', manifestPath);
    console.log('File exists: ', fs.existsSync(manifestPath));

    console.log('Files in current directory');
    fs.readdirSync(process.cwd()).forEach(file => {
      console.log(`  - ${file}`);
    });
  }

  private async loadPluginConfiguration(): Promise<void> {
    try {
      const pluginDeclaration = await loadYamlFile<PluginDeclaration>("manifest.yaml");
      this.declaration = pluginDeclaration;

      if (this.declaration.plugins.providers) {
        for (const toolFilePath of this.declaration.plugins.providers) {
          const toolProviderConfiguration = await loadYamlFile<ToolProviderConfiguration>(toolFilePath);
          this.toolProviderConfigurations.push(toolProviderConfiguration);
        }
      }

      if (this.declaration.plugins.tools) {
        for (const toolFilePath of this.declaration.plugins.tools) {
          const tool = await loadYamlFile<ToolConfiguration>(toolFilePath);
          this.toolConfigurations.push(tool);
        }
      }

      if (this.declaration.plugins.models) {
        for (const modelFilePath of this.declaration.plugins.models) {

        }
      }

    } catch (error) {
      throw new Error(`Error loading plugin manifest file: ${error}`);
    }
  }

  private async loadPluginAssets(): Promise<void> {
  }
}
