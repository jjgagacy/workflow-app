import { AIModel } from "@/ai/model_runtime/classes/ai-model.class";
import { ModelProviderDeclaration } from "@/ai/model_runtime/classes/model-provider.class";
import { AgentStrategyConfiguration, AgentStrategyDeclaration } from "@/ai/model_runtime/classes/plugin/agent";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { EndpointConfiguration, EndpointDeclaration } from "@/ai/model_runtime/classes/plugin/endpoint";
import { ToolConfiguration, ToolProviderDeclaration } from "@/ai/model_runtime/classes/tool-provider.class";
import { loadYamlFile } from "@/common/utils/yaml";
import { IMAGE_MIME_TYPES } from "@/config/file.constants";
import { Injectable } from "@nestjs/common";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

@Injectable()
export class PluginDeclarationService {
  async decodePluginPath(pluginPath: string): Promise<PluginDeclaration[]> {
    try {
      const items = await readdir(pluginPath, { withFileTypes: true });
      const pluginDeclarations: PluginDeclaration[] = [];

      for (const item of items) {
        if (!item.isDirectory()) continue;
        const itemPath = join(pluginPath, item.name);
        const manifestPath = resolve(itemPath, 'manifest.yaml');
        const manifestExists = existsSync(manifestPath);
        if (!manifestExists) {
          console.warn(`Manifest file not found for plugin at "${itemPath}". Skipping.`);
          continue;
        }

        const pluginDeclaration = await this.decodePluginDeclaration(itemPath);
        if (pluginDeclaration) {
          pluginDeclarations.push(pluginDeclaration);
        }
      }

      return pluginDeclarations;
    } catch (error: any) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`Plugin path "${pluginPath}" does not exist.`);
        return [];
      }
      console.error(`Error reading plugin path "${pluginPath}": ${(error as Error).message}`);
    }
    return [];
  }

  async decodePluginDeclaration(pluginPath: string): Promise<PluginDeclaration | null> {
    try {
      const manifestPath = resolve(pluginPath, 'manifest.yaml');
      const manifestExists = existsSync(manifestPath);
      if (!manifestExists) {
        console.warn(`Manifest file not found for plugin at "${pluginPath}".`);
        return null;
      }
      const pluginDeclaration = await loadYamlFile<PluginDeclaration>(manifestPath);

      // tool provider and model provider may have multiple configuration files, 
      // need to read them one by one and merge them into the declaration
      if (pluginDeclaration.plugins.tools) {
        for (const toolFilePath of pluginDeclaration.plugins.tools) {
          const fullToolFilePath = resolve(pluginPath, toolFilePath);
          const toolProviderConfiguration = await loadYamlFile<ToolProviderDeclaration>(fullToolFilePath);
          const toolConfigurations: ToolConfiguration[] = [];
          if (toolProviderConfiguration.toolFiles) {
            for (const toolConfigFile of toolProviderConfiguration.toolFiles) {
              const fullToolConfigFilePath = resolve(pluginPath, toolConfigFile);
              const toolConfig = await loadYamlFile<ToolConfiguration>(fullToolConfigFilePath);
              toolConfigurations.push(toolConfig);
            }
          }
          toolProviderConfiguration.tools = toolConfigurations;
          pluginDeclaration.tool = toolProviderConfiguration;
        }
      }
      // model provider and models fetched together
      if (pluginDeclaration.plugins.models) {
        for (const modelFilePath of pluginDeclaration.plugins.models) {
          const fullModelFilePath = resolve(pluginPath, modelFilePath);
          const modelConfig = await loadYamlFile<ModelProviderDeclaration>(fullModelFilePath);
          const models: AIModel[] = [];
          if (modelConfig.modleFiles) {
            for (const modelConfigFile of modelConfig.modleFiles) {
              const fullModelConfigFilePath = resolve(pluginPath, modelConfigFile);
              const modelConfigDetail = await loadYamlFile<AIModel>(fullModelConfigFilePath);
              models.push(modelConfigDetail);
            }
          }
          modelConfig.models = models;
          pluginDeclaration.model = modelConfig;
        }
      }
      // agent strategy fetched together
      if (pluginDeclaration.plugins.agentStrategies) {
        for (const strategyFilePath of pluginDeclaration.plugins.agentStrategies) {
          const fullStrategyFilePath = resolve(pluginPath, strategyFilePath);
          const strategyConfig = await loadYamlFile<AgentStrategyDeclaration>(fullStrategyFilePath);
          const strategies: AgentStrategyConfiguration[] = [];
          if (strategyConfig.strategyFiles) {
            for (const strategyConfigFile of strategyConfig.strategyFiles) {
              const fullStrategyConfigFilePath = resolve(pluginPath, strategyConfigFile);
              const strategyConfigDetail = await loadYamlFile<AgentStrategyConfiguration>(fullStrategyConfigFilePath);
              strategies.push(strategyConfigDetail);
            }
          }
          strategyConfig.strategies = strategies;
          pluginDeclaration.agentStrategy = strategyConfig;
        }
      }
      // endpoint fetched together
      if (pluginDeclaration.plugins.endpoints) {
        for (const endpointFilePath of pluginDeclaration.plugins.endpoints) {
          const fullEndpointFilePath = resolve(pluginPath, endpointFilePath);
          const endpointConfig = await loadYamlFile<EndpointDeclaration>(fullEndpointFilePath);
          const endpointConfigurations: EndpointConfiguration[] = [];
          if (endpointConfig.endpointFiles) {
            for (const endpointConfigFile of endpointConfig.endpointFiles) {
              const fullEndpointConfigFilePath = resolve(pluginPath, endpointConfigFile);
              const endpointConfigDetail = await loadYamlFile<EndpointConfiguration>(fullEndpointConfigFilePath);
              endpointConfigurations.push(endpointConfigDetail);
            }
          }
          endpointConfig.endpoints = endpointConfigurations;
          pluginDeclaration.endpoint = endpointConfig;
        }
      }
      this.logPluginDeclaration(pluginDeclaration);
      return pluginDeclaration;
    } catch (error: any) {
      // console.log(`debug backtrace: ${(error as Error).stack}`);
      console.error(`Error reading plugin declaration for "${pluginPath}": ${(error as Error).message}`);
      return null;
    }
  }

  private logPluginDeclaration(pluginDeclaration: PluginDeclaration) {
    console.log(`Decoded plugin declaration for "${pluginDeclaration.name}":`);
    console.log(`- Tool Provider: ${pluginDeclaration.tool ? pluginDeclaration.tool.identity.name : 'None'}`);
    console.log(`- Model Provider: ${pluginDeclaration.model ? pluginDeclaration.model.provider : 'None'}`);
    console.log(`- Agent Strategy: ${pluginDeclaration.agentStrategy ? pluginDeclaration.agentStrategy.identity.name : 'None'}`);
    console.log(`- Endpoint: ${pluginDeclaration.endpoint ? pluginDeclaration.endpoint.endpoints.length : 'None'}`);
  }

  async readPluginFile(filePath: string): Promise<Buffer> {
    return readFile(filePath);
  }

  getFileMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return IMAGE_MIME_TYPES[ext || ''] || 'application/octet-stream';
  }
}