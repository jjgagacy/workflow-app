import { PluginConfig } from "@/config/config";
import { PluginDeclaration } from "@/core/entities/plugin/declaration";
import { loadYamlFile } from "@/utils/yaml.util";
import path from "path";
import * as fs from 'fs';
import { ToolConfiguration } from "@/core/entities/plugin/declaration/tool";
import { ToolProviderConfiguration } from "@/core/entities/plugin/provider";
import { ModelProvider, ModelProviderConfiguration } from "@/core/entities/plugin/declaration/model";
import { EndpointProviderConfiguration } from "@/core/entities/plugin/declaration/endpoint";
import { AgentStrategyProviderConfiguration } from "@/core/entities/plugin/agent";
import { AnyConstructor, ClassInfo, ModuleClassScanner } from "@/core/classes/module-loader";
import { ToolProvider } from "@/interfaces/tool/tool-provider";
import { Tool } from "@/interfaces/tool/tool";
import { ModelType } from "@/core/entities/enums/model.enum";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { TextEmbeddingModel } from "@/interfaces/model/text-embedding.model";
import { LargeLanguageModel } from "@/interfaces/model/llm.model";
import { RerankModel } from "@/interfaces/model/rerank.model";
import { TTSModel } from "@/interfaces/model/tts.model";
import { Speech2TextModel } from "@/interfaces/model/speech2text.model";
import { ModerationModel } from "@/interfaces/model/moderation.model";
import { Endpoint } from "@/interfaces/endpoint/endpoint";
import { AgentStrategy } from "@/interfaces/agent/agent-strategy";
import { PluginAsset } from "@/core/entities/event/asset";

export interface ToolProviderRegistration {
  module: string;
  className: string;
  providerConfiguration: ToolProviderConfiguration;
  providerClass: ToolProvider | undefined;
  tools: Map<string, [ToolConfiguration, Tool, string, string?]>;
}

export interface ModelProviderRegistration {
  module: string;
  modelProviderConfiguration: ModelProviderConfiguration;
  modelProviderClass: ModelProvider | undefined;
  models: Map<ModelType, AIModel>;
}

export interface AgentStrategyProviderRegistration {
  module: string;
  className: string;
  providerConfiguration: AgentStrategyProviderConfiguration;
  providerClass: AgentStrategy | undefined;
}

export interface EndpointRegistration {
  module: string;
  className: string;
  path: string;
  methods: string[];
  endpointClass: typeof Endpoint | undefined;
}

export class PluginRegistry {
  declaration!: PluginDeclaration;
  toolProviderConfigurations: ToolProviderConfiguration[] = [];
  modelProviderConfigurations: ModelProviderConfiguration[] = [];
  endpointProviderConfigurations: EndpointProviderConfiguration[] = [];
  agentStrategyProviderConfigurations: AgentStrategyProviderConfiguration[] = [];

  toolsMapping: Map<string, ToolProviderRegistration> = new Map();
  modelMapping: Map<string, ModelProviderRegistration> = new Map();
  strategyMapping: Map<string, AgentStrategyProviderRegistration> = new Map();
  endpoints: EndpointRegistration[] = [];

  files: PluginAsset[] = [];

  constructor(private config: PluginConfig) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadPluginConfiguration();
      await this.resolvePluginHandlers();
      await this.loadPluginAssets();
      this.logRegistry();
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

  private logRegistry() {
    for (const tool of this.toolProviderConfigurations) {
      console.log(`Installed tool: ${tool.identity.name}`);
    }
    for (const model of this.modelProviderConfigurations) {
      console.log(`Installed model: ${model.provider}`);
    }
    for (const endpoint of this.endpointProviderConfigurations) {
      console.log(`Installed endpoint: ${endpoint.endpoints.join(', ')}`);
    }
    for (const agent of this.agentStrategyProviderConfigurations) {
      console.log(`Installed agent strategy: ${agent.identity.name}`);
    }
  }

  private async loadPluginConfiguration(): Promise<void> {
    try {
      const pluginDeclaration = await loadYamlFile<PluginDeclaration>("manifest.yaml");
      this.declaration = pluginDeclaration;

      if (this.declaration.plugins.tools) {
        for (const toolFilePath of this.declaration.plugins.tools) {
          const toolProviderConfiguration = await loadYamlFile<ToolProviderConfiguration>(toolFilePath);
          this.toolProviderConfigurations.push(toolProviderConfiguration);
        }
      }
      if (this.declaration.plugins.models) {
        for (const modelFilePath of this.declaration.plugins.models) {
          const model = await loadYamlFile<ModelProviderConfiguration>(modelFilePath);
          this.modelProviderConfigurations.push(model);
        }
      }
      if (this.declaration.plugins.endpoints) {
        for (const endpointFilePath of this.declaration.plugins.endpoints) {
          const endpoint = await loadYamlFile<EndpointProviderConfiguration>(endpointFilePath);
          this.endpointProviderConfigurations.push(endpoint);
        }
      }
      if (this.declaration.plugins.agentStrategies) {
        for (const agentStrategyFilePath of this.declaration.plugins.agentStrategies) {
          const agentStrategy = await loadYamlFile<AgentStrategyProviderConfiguration>(agentStrategyFilePath);
          this.agentStrategyProviderConfigurations.push(agentStrategy);
        }
      }
    } catch (error) {
      throw new Error(`Error loading plugin manifest file: ${error}`);
    }
  }

  private async resolvePluginHandlers(): Promise<void> {
    await this.resolveToolProviders();
    await this.resolveModelProviders();
    await this.resolveAgentProviders();
    await this.resolveEndpoints();
  }

  private async loadPluginAssets(): Promise<void> {
    const assetsDir = '_assets';

    if (!fs.existsSync(assetsDir)) {
      return;
    }

    const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(assetsDir, entry.name);
        const data = fs.readFileSync(filePath);
        this.files.push({
          filename: entry.name,
          data: data,
        });
      }
    }
    console.log('files: ', this.files);
  }

  private async resolveToolProviders(): Promise<void> {
    for (const providerConfiguration of this.toolProviderConfigurations) {
      const providerName = providerConfiguration.identity.name;
      const providerFilePath = providerConfiguration.extra.node?.module;
      let providerCls: ClassInfo<new (...args: any[]) => any> | undefined;
      if (providerFilePath) {
        providerCls = await this.loadSingleSubclass(
          providerFilePath,
          ToolProvider,
          providerConfiguration.extra.node?.class,
        )
      }

      const tools = new Map();
      for (const toolPath of providerConfiguration.plugins.tools) {
        try {
          const toolConfiguration = await loadYamlFile<ToolConfiguration>(toolPath);
          const toolFilePath = toolConfiguration.extra.node?.module;
          const toolClassName = toolConfiguration.extra.node?.class;
          if (!toolFilePath) continue;

          const toolCls = await this.loadSingleSubclass(toolFilePath, Tool, toolClassName);
          tools.set(
            toolConfiguration.identity.name || toolClassName,
            [toolConfiguration, toolCls.class, toolFilePath, toolClassName]
          );
        } catch (error) {
          throw new Error(`Error loading tool manifest: ${toolPath}: ${error}`);
        }
      }

      const providerInstance = new (providerCls?.class as any)();
      const registration: ToolProviderRegistration = {
        module: providerFilePath || '',
        className: providerConfiguration.extra.node?.class || '',
        providerConfiguration,
        providerClass: providerInstance,
        tools: tools,
      };

      this.toolsMapping.set(providerName, registration);
    }
  }

  private async resolveModelProviders(): Promise<void> {
    for (const provider of this.modelProviderConfigurations) {
      const providerFilePath = provider.extra.node?.module;
      if (!providerFilePath) {
        continue
      }
      const providerModelCls = await this.loadSingleSubclass(
        providerFilePath,
        ModelProvider,
      )

      const models = new Map<ModelType, AIModel>;
      if (provider.extra.node?.models) {
        for (const modelSource of provider.extra.node?.models) {
          const modelClasses = await this.loadMultiSubclasses(modelSource, AIModel);
          for (const modelCls of modelClasses) {
            if (this.isStrictSubclasses(
              modelCls,
              LargeLanguageModel,
              TextEmbeddingModel,
              RerankModel,
              TTSModel,
              Speech2TextModel,
              ModerationModel
            )) {
              const modelInstance = new (modelCls.class as any)(provider.models);
              const modelType = (modelCls as any).modelType as ModelType;
              models.set(modelType, modelInstance);
            }
          }
        }
      }

      const providerModelInstance = new (providerModelCls.class as any)(provider, provider.models);
      const registration: ModelProviderRegistration = {
        module: providerFilePath,
        modelProviderConfiguration: provider,
        modelProviderClass: providerModelInstance,
        models: models,
      };
      this.modelMapping.set(provider.provider, registration);
    }
  }

  private async resolveAgentProviders(): Promise<void> {
    for (const provider of this.agentStrategyProviderConfigurations) {
      if (provider.strategies) {
        for (const strategy of provider.strategies) {
          const module = strategy.extra.node?.module;
          if (!module) {
            continue;
          }

          const strategyCls = await this.loadSingleSubclass(
            module,
            AgentStrategy,
            strategy.extra.node?.class,
          );

          const strategyInstance = new (strategyCls.class as any)();
          const registration: AgentStrategyProviderRegistration = {
            module: module,
            className: strategy.extra.node?.class || '',
            providerConfiguration: provider,
            providerClass: strategyInstance,
          };

          this.strategyMapping.set(provider.identity.name, registration);
        }
      }
    }
  }

  private async resolveEndpoints(): Promise<void> {
    for (const endpointProvider of this.endpointProviderConfigurations) {
      if (endpointProvider.endpoints) {
        for (const endpoint of endpointProvider.endpoints) {
          const module = endpoint.extra.node?.module;
          if (!module) {
            continue;
          }

          const endpointCls = await this.loadSingleSubclass(
            module,
            Endpoint,
            endpoint.extra.node?.class,
          );

          const endpointInstance = new (endpointCls.class as any)();
          const registration: EndpointRegistration = {
            module: module,
            className: endpoint.extra.node?.class || '',
            path: endpoint.path,
            methods: [endpoint.method],
            endpointClass: endpointInstance,
          };
          this.endpoints.push(registration);
        }
      }
    }
  }

  private isStrictSubclasses(cls: any, ...parentCls: any[]): boolean {
    return parentCls.some(parent =>
      cls.prototype instanceof parent && cls !== parent);
  }

  private async loadSingleSubclass<
    T extends new (...args: any[]) => any,
    P extends AnyConstructor,
  >(filePath: string, parentClass: P, className: string = ''): Promise<ClassInfo<T>> {
    const subClasses = await ModuleClassScanner.findSubClasses<T, P>(filePath, parentClass);
    if (!subClasses) {
      throw new Error(`Failed to find subclass: ${filePath}`);
    }

    if (className !== '') {
      const classByName = subClasses.find(classInfo => {
        return classInfo.name === className;
      });
      if (classByName) return classByName;
    }

    const defaultExportClass = subClasses.find(classInfo => classInfo.isDefault);
    if (defaultExportClass) {
      return defaultExportClass;
    }

    throw new Error(`Error loading single subclass: ${filePath}, please check the file data.`);
  }

  private async loadMultiSubclasses<
    T extends new (...args: any[]) => any,
    P extends AnyConstructor,
  >(filePath: string, parentClass: P): Promise<ClassInfo<T>[]> {
    const subClasses = await ModuleClassScanner.findSubClasses<T, P>(filePath, parentClass);
    if (!subClasses) {
      throw new Error(`Failed to find subclass: ${filePath}`);
    }
    return subClasses;
  }

  getToolProviderCls(providerName: string): ToolProvider | undefined {
    const registration = this.toolsMapping.get(providerName);
    return registration?.providerClass;
  }

  getToolCls(providerName: string, toolName: string): Tool | undefined {
    const registration = this.toolsMapping.get(providerName);
    if (!registration) return undefined;
    const toolEntry = registration.tools.get(toolName);
    return toolEntry ? toolEntry[1] : undefined;
  }

  getModelProviderCls(providerName: string): ModelProvider | undefined {
    const registration = this.modelMapping.get(providerName);
    return registration?.modelProviderClass;
  }

  getAgentStrategyCls(strategyName: string): AgentStrategy | undefined {
    const registration = this.strategyMapping.get(strategyName);
    return registration?.providerClass;
  }

}
