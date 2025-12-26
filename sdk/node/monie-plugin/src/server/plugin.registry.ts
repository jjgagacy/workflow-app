import { PluginConfig } from "@/config/config";
import { loadYamlFile } from "@/utils/yaml.util";
import path from "path";
import * as fs from 'fs';
import { ToolConfiguration } from "@/core/entities/plugin/declaration/tool";
import { ToolProviderConfiguration } from "@/core/entities/plugin/provider";
import { ModelProviderConfiguration } from "@/core/entities/plugin/declaration/model";
import { EndpointConfiguration, EndpointProviderConfiguration } from "@/core/entities/plugin/declaration/endpoint";
import { AgentStrategyProviderConfiguration } from "@/core/entities/plugin/agent";
import { AnyConstructor, ClassInfo, ModuleClassScanner } from "@/core/classes/module-loader";
import { TOOL_PROVIDER_SYMBOL, ToolProvider } from "@/interfaces/tool/tool-provider";
import { isToolClass, Tool, TOOL_SYMBOL, ToolClassType } from "@/interfaces/tool/tool";
import { ModelType } from "@/core/entities/enums/model.enum";
import { AIModel, AIMODEL_SYMBOL } from "@/core/entities/plugin/ai-model";
import { TEXT_EMBEDDING_MODEL_SYMBOL, TextEmbeddingModel } from "@/interfaces/model/text-embedding.model";
import { LARGE_LANGUAGE_MODEL_SYMBOL, LargeLanguageModel } from "@/interfaces/model/llm.model";
import { RERANK_MODEL_SYMBOL, RerankModel } from "@/interfaces/model/rerank.model";
import { TTS_MODEL_SYMBOL, TTSModel } from "@/interfaces/model/tts.model";
import { SPEECH2TEXT_MODEL_SYMBOL, Speech2TextModel } from "@/interfaces/model/speech2text.model";
import { MODERATION_MODEL_SYMBOL, ModerationModel } from "@/interfaces/model/moderation.model";
import { Endpoint, ENDPOINT_SYMBOL, EndpointClassType, isEndpointClass } from "@/interfaces/endpoint/endpoint";
import { AGENT_STATEGY_SYMBOL, AgentStrategy, AgentStrategyClassType, isAgentStrategyClass } from "@/interfaces/agent/agent-strategy";
import { PluginAsset } from "@/core/entities/event/asset";
import { PluginDeclaration } from "@/core/entities/plugin/declaration/declaration";
import { MODEL_PROVIDER_SYMBOL, ModelProvider } from "@/interfaces/model/model-provider";
import { matchMethods, matchPath, Request } from "@/core/entities/endpoint/endpoint.entity";
import { OAuthProvider } from "@/interfaces/oauth/oauth-provider";
import { hasStaticMarker } from "@/interfaces/marker.class";

export interface ToolRegistration {
  configuration: ToolConfiguration;
  toolClassType: ToolClassType;
  toolFilePath: string;
  toolClassName?: string | undefined;
  cpuBound: boolean;
}

export interface ToolProviderRegistration {
  module: string;
  className: string;
  providerConfiguration: ToolProviderConfiguration;
  providerClass: ToolProvider | undefined;
  tools: Map<string, ToolRegistration>;
  cpuBound: boolean;
}

export interface ModelProviderRegistration {
  module: string;
  modelProviderConfiguration: ModelProviderConfiguration;
  modelProviderClass: ModelProvider | undefined;
  models: Map<ModelType, AIModel>;
  cpuBound: boolean;
}

export interface AgentStrategyProviderRegistration {
  agentStrategyProvider: AgentStrategyProviderConfiguration;
  strategies: Map<string, AgentStrategyRegistration>;
}

export interface AgentStrategyRegistration {
  module: string;
  className: string;
  providerConfiguration: AgentStrategyProviderConfiguration;
  providerClassType: AgentStrategyClassType | undefined;
  cpuBound: boolean;
}

export interface EndpointRegistration {
  module: string;
  className: string;
  path: string;
  methods: string[];
  endpointClassType: EndpointClassType | undefined;
  cpuBound: boolean;
}

export class PluginRegistry {
  declaration!: PluginDeclaration;
  toolProviderConfigurations: ToolProviderConfiguration[] = [];
  modelProviderConfigurations: ModelProviderConfiguration[] = [];
  endpointProviderConfigurations: EndpointProviderConfiguration[] = [];
  agentStrategyProviderConfigurations: AgentStrategyProviderConfiguration[] = [];

  toolsMapping: Map<string, ToolProviderRegistration> = new Map();
  modelMapping: Map<string, ModelProviderRegistration> = new Map();
  agentStrategyMapping: Map<string, AgentStrategyProviderRegistration> = new Map();
  endpoints: EndpointRegistration[] = [];

  files: PluginAsset[] = [];

  private initPromise: Promise<void> | null = null;
  manifestFilePath: string;

  constructor(private config: PluginConfig) {
    this.manifestFilePath = path.resolve(process.cwd(), this.config.baseDir, 'manifest.yaml');
    this.initPromise = this.initialize();
    this.initPromise.catch(err => {
      console.error(`Failed to initialize: ${err}`);
    });
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadPluginConfiguration();
      await this.resolvePluginHandlers();
      await this.loadPluginAssets();
      await this.loadManifestLog();
      this.logRegistry();
    } catch (error) {
      throw new Error(`Failed to initialize plugin: ${error}`);
    }
  }

  async loadManifestLog() {
    console.log('Current working directory: ', path.dirname(this.manifestFilePath));
    console.log('Looking for manifest at: ', this.manifestFilePath);
    console.log('File exists: ', fs.existsSync(this.manifestFilePath));

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
    console.log('files: ', this.files.map(f => f.filename));
  }

  private async loadPluginConfiguration(): Promise<void> {
    try {
      const pluginDeclaration = await loadYamlFile<PluginDeclaration>(this.manifestFilePath);
      this.declaration = pluginDeclaration;

      if (this.declaration.plugins.tools) {
        for (const toolFilePath of this.declaration.plugins.tools) {
          const toolProviderConfiguration = await loadYamlFile<ToolProviderConfiguration>(resolveFrom(this.manifestFilePath, toolFilePath));
          this.toolProviderConfigurations.push(toolProviderConfiguration);
        }
      }
      if (this.declaration.plugins.models) {
        for (const modelFilePath of this.declaration.plugins.models) {
          const model = await loadYamlFile<ModelProviderConfiguration>(resolveFrom(this.manifestFilePath, modelFilePath));
          this.modelProviderConfigurations.push(model);
        }
      }
      if (this.declaration.plugins.endpoints) {
        for (const endpointFilePath of this.declaration.plugins.endpoints) {
          const endpoint = await loadYamlFile<EndpointProviderConfiguration>(resolveFrom(this.manifestFilePath, endpointFilePath));
          this.endpointProviderConfigurations.push(endpoint);
        }
      }
      if (this.declaration.plugins.agentStrategies) {
        for (const agentStrategyFilePath of this.declaration.plugins.agentStrategies) {
          const agentStrategy = await loadYamlFile<AgentStrategyProviderConfiguration>(resolveFrom(this.manifestFilePath, agentStrategyFilePath));
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
    if (!fs.existsSync(resolveFrom(this.manifestFilePath, assetsDir))) {
      return;
    }

    const entries = fs.readdirSync(resolveFrom(this.manifestFilePath, assetsDir), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(resolveFrom(this.manifestFilePath, assetsDir), entry.name);
        const data = fs.readFileSync(filePath);
        this.files.push({
          filename: entry.name,
          data: data,
        });
      }
    }
  }

  private async resolveToolProviders(): Promise<void> {
    for (const providerConfiguration of this.toolProviderConfigurations) {
      const providerName = providerConfiguration.identity.name;
      const providerFilePath = providerConfiguration.extra.node?.module;
      let providerCls: ClassInfo<new (...args: any[]) => any> | undefined;
      if (providerFilePath) {
        providerCls = await this.loadSingleSubclass(
          resolveFrom(this.manifestFilePath, providerFilePath),
          TOOL_PROVIDER_SYMBOL,
          providerConfiguration.extra.node?.class,
        )
      }

      const tools = new Map<string, ToolRegistration>();
      for (const toolPath of providerConfiguration.plugins.tools) {
        try {
          const toolConfiguration = await loadYamlFile<ToolConfiguration>(resolveFrom(this.manifestFilePath, toolPath));
          const toolFilePath = toolConfiguration.extra.node?.module;
          const toolClassName = toolConfiguration.extra.node?.class;
          if (!toolFilePath) continue;

          const toolCls = await this.loadSingleSubclass(resolveFrom(this.manifestFilePath, toolFilePath), TOOL_SYMBOL, toolClassName);
          if (!isToolClass(toolCls.class)) {
            throw new Error('Invalid tool class');
          }
          const toolRegistration: ToolRegistration = {
            configuration: toolConfiguration,
            toolClassType: toolCls.class,
            toolFilePath: toolFilePath,
            toolClassName: toolClassName,
            cpuBound: toolConfiguration.extra.node?.cpuBound || false,
          };
          tools.set(
            toolConfiguration.identity.name || toolClassName || '',
            toolRegistration,
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
        cpuBound: providerConfiguration.extra.node?.cpuBound || false,
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
        resolveFrom(this.manifestFilePath, providerFilePath),
        MODEL_PROVIDER_SYMBOL,
      )

      const models = new Map<ModelType, AIModel>();
      if (provider.extra.node?.models) {
        for (const modelSource of provider.extra.node?.models) {
          const modelClasses = await this.loadMultiSubclasses(resolveFrom(this.manifestFilePath, modelSource), AIMODEL_SYMBOL);
          for (const modelCls of modelClasses) {
            if (this.isStrictSubclasses(
              modelCls,
              LARGE_LANGUAGE_MODEL_SYMBOL,
              TEXT_EMBEDDING_MODEL_SYMBOL,
              RERANK_MODEL_SYMBOL,
              TTS_MODEL_SYMBOL,
              SPEECH2TEXT_MODEL_SYMBOL,
              MODERATION_MODEL_SYMBOL
            )) {
              const modelInstance = new (modelCls.class as any)(provider, provider.models);
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
        cpuBound: provider.extra.node?.cpuBound || false,
      };
      this.modelMapping.set(provider.provider, registration);
    }
  }

  private async resolveAgentProviders(): Promise<void> {
    for (const provider of this.agentStrategyProviderConfigurations) {
      if (provider.strategies) {
        const strategies = new Map<string, AgentStrategyRegistration>();
        for (const strategy of provider.strategies) {
          const module = strategy.extra.node?.module;
          if (!module) {
            continue;
          }

          const strategyCls = await this.loadSingleSubclass(
            resolveFrom(this.manifestFilePath, module),
            AGENT_STATEGY_SYMBOL,
            strategy.extra.node?.class,
          );

          if (!isAgentStrategyClass(strategyCls.class)) {
            throw new Error('Invalid agent strategy class');
          }

          const registration: AgentStrategyRegistration = {
            module: module,
            className: strategy.extra.node?.class || '',
            providerConfiguration: provider,
            providerClassType: strategyCls.class,
            cpuBound: strategy.extra.node?.cpuBound || false,
          };
          strategies.set(strategy.identity.name, registration);
        }
        const providerRegistration: AgentStrategyProviderRegistration = {
          agentStrategyProvider: provider,
          strategies: strategies,
        };
        this.agentStrategyMapping.set(provider.identity.name, providerRegistration);
      }
    }
  }

  private async resolveEndpoints(): Promise<void> {
    for (const endpointProvider of this.endpointProviderConfigurations) {
      if (endpointProvider.endpoints) {
        for (const endpointFilePath of endpointProvider.endpoints) {
          const endpoint = await loadYamlFile<EndpointConfiguration>(resolveFrom(this.manifestFilePath, endpointFilePath));
          const module = endpoint.extra.node?.module;
          if (!module) {
            continue;
          }

          const endpointCls = await this.loadSingleSubclass(
            resolveFrom(this.manifestFilePath, module),
            ENDPOINT_SYMBOL,
            endpoint.extra.node?.class,
          );

          if (!isEndpointClass(endpointCls.class)) {
            throw new Error('Invalid endpoint class');
          }

          const registration: EndpointRegistration = {
            module: module,
            className: endpoint.extra.node?.class || '',
            path: endpoint.path,
            methods: [endpoint.method],
            endpointClassType: endpointCls.class,
            cpuBound: endpoint.extra.node?.cpuBound || false,
          };
          this.endpoints.push(registration);
        }
      }
    }
  }

  dispatchEndpointRequest(request: Request): {
    endpoint: EndpointRegistration | undefined;
    values: Record<string, any>;
  } {
    const requestMethod = request.method;
    const requestPath = request.path;

    // 按路径长度排序，确保精确匹配优先
    const sortedEndpoints = [...this.endpoints].sort((a, b) => {
      // 更具体的路径优先（参数少的优先）
      const aParamCount = (a.path.match(/:[^\/]+/g) || []).length;
      const bParamCount = (b.path.match(/:[^\/]+/g) || []).length;
      if (aParamCount !== bParamCount) {
        return aParamCount - bParamCount;
      }
      // 路径长的优先
      return b.path.length - a.path.length;
    });

    // 遍历所有端点，寻找匹配
    for (const endpoint of sortedEndpoints) {
      // 1. 检查方法是否匹配
      if (!matchMethods(requestMethod, endpoint.methods)) {
        continue;
      }
      // 2. 检查路径是否匹配
      const { matched, params } = matchPath(requestPath, endpoint.path);
      if (!matched) {
        continue;
      }
      // 3. 检查端点类是否存在
      if (!endpoint.endpointClassType) {
        throw new Error(`Endpoint class for ${endpoint.className} is undefined`);
      }
      // 4. 返回匹配的端点和参数
      return {
        endpoint: endpoint,
        values: params
      };
    }
    throw new Error(`No endpoint found for ${requestMethod} ${requestPath}`);
  }

  getOAuthProviderClassType(provider: string): typeof OAuthProvider | undefined {
    const registration = this.toolsMapping.get(provider);
    if (registration && registration.providerClass instanceof OAuthProvider) {
      return registration.providerClass.constructor as typeof OAuthProvider;
    }
    return undefined;
  }

  private isStrictSubclasses(cls: any, ...parentMarkers: symbol[]): boolean {
    return parentMarkers.some(parent => hasStaticMarker(cls, parent));
  }

  private async loadSingleSubclass<
    T extends AnyConstructor,
  >(filePath: string, requiredSymbol: symbol, className: string = ''): Promise<ClassInfo<T>> {
    const subClasses = await ModuleClassScanner.findSubClasses<T>(filePath, requiredSymbol);
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
    T extends AnyConstructor
  >(filePath: string, requiredSymbol: symbol): Promise<ClassInfo<T>[]> {
    const subClasses = await ModuleClassScanner.findSubClasses<T>(filePath, requiredSymbol);
    if (!subClasses) {
      throw new Error(`Failed to find subclass: ${filePath}`);
    }
    return subClasses;
  }

  getToolProviderInstance(providerName: string): ToolProvider | undefined {
    const registration = this.toolsMapping.get(providerName);
    return registration?.providerClass;
  }

  getToolClassRegistration(providerName: string, toolName: string): ToolRegistration | undefined {
    const registration = this.toolsMapping.get(providerName);
    if (!registration) return undefined;
    return registration.tools.get(toolName);
  }

  getModelProviderInstance(providerName: string): ModelProvider | undefined {
    const registration = this.modelMapping.get(providerName);
    return registration?.modelProviderClass;
  }

  getAgentStrategyRegistration(strategyName: string, agent: string): AgentStrategyRegistration | undefined {
    const providerData = this.agentStrategyMapping.get(strategyName);
    if (providerData) {
      return providerData.strategies.get(agent);
    }
    return undefined;
  }

  getModelInstance(provider: string, modelType: ModelType): AIModel | undefined {
    const providerData = this.modelMapping.get(provider);
    if (providerData) {
      return providerData.models.get(modelType);
    }
    return undefined;
  }
}

function resolveFrom(baseFile: string, relativePath: string): string {
  return path.resolve(path.dirname(baseFile), relativePath);
}
