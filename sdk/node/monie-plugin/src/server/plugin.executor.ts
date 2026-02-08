import { PluginConfig } from "../config/config.js";
import { PluginRegistry } from "./plugin.registry.js";
import { Session } from "../core/classes/runtime.js";
import { ToolGetRuntimeParametersRequest, ToolInvokeRequest, ToolValidateCredentialsRequest } from "../core/entities/plugin/request/tool.request.js";
import { AgentInvokeRequest } from "../core/entities/plugin/request/agent.request.js";
import { ModelGetAIModelSchemasRequest, ModelGetLLMNumTokensRequest, ModelGetTextEmbeddingNumTokensRequest, ModelGetTTSVoicesRequest, ModelInvokeLLMRequest, ModelInvokeRerankRequest, ModelInvokeSpeech2TextRequest, ModelInvokeTextEmbeddingRequest, ModelInvokeTTSRequest, ModelValidateModelCredentialsRequest, ModelValidateProviderCredentialsRequest } from "../core/entities/plugin/request/model.request.js";
import { EndpointInvokeRequest } from "../core/entities/plugin/request/endpoint.request.js";
import { OAuthGetAuthorizationUrlRequest, OAuthGetCredentialsRequest, OAuthRefreshCredentialsRequest } from "../core/entities/plugin/request/oauth.request.js";
import { DynamicParameterFetchParameterOptionsRequest } from "../core/entities/plugin/request/dynamic-parameter.js";
import { DynamicSelect } from "../interfaces/dynamic-select/dynamic-select.js";
import { AgentRuntime, AgentStrategy } from "../interfaces/agent/agent-strategy.js";
import { Tool, ToolRuntime } from "../interfaces/tool/tool.js";
import { LargeLanguageModel } from "../interfaces/model/llm.model.js";
import { TextEmbeddingModel } from "../interfaces/model/text-embedding.model.js";
import { ModelType } from "../core/entities/enums/model.enum.js";
import { EmbeddingInputType } from "../core/entities/model/text-embedding.entity.js";
import { RerankModel } from "../interfaces/model/rerank.model.js";
import { TTSModel } from "../interfaces/model/tts.model.js";
import { bufferToHex } from "../utils/buffer.util.js";
import { Speech2TextModel } from "../interfaces/model/speech2text.model.js";
import { parseRawHttpRequest } from "../core/entities/endpoint/endpoint.entity.js";
import { OAuthProvider } from "../interfaces/oauth/oauth-provider.js";
import { HandleResult, TaskType } from "./route/route.handler.js";
import { Endpoint } from "../interfaces/endpoint/endpoint.js";
import { Logger } from "../config/logger.js";

export class PluginExecutor {
  constructor(
    private config: PluginConfig,
    private registry: PluginRegistry
  ) { }

  private wrapIOResult<T>(
    value: T,
  ): HandleResult {
    return {
      taskType: TaskType.IO,
      result: value,
    };
  }

  async* invokeTool(
    session: Session,
    request: ToolInvokeRequest
  ): AsyncGenerator<any> | Promise<HandleResult> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      Logger.error(`Tool provider not found: ${request.provider}`);
      return
    }

    const toolRegistration = this.registry.getToolClassRegistration(request.provider, request.tool);
    const toolType = toolRegistration?.toolClassType;
    const cpuBound = toolRegistration?.cpuBound;
    if (cpuBound) {
      return { taskType: TaskType.CPU };
    }

    if (!toolType) {
      Logger.error(`Tool not found: ${request.tool} for provider: ${request.provider}`);
      return;
    }

    const runtime = new ToolRuntime(request.credentials, request.credentialType, request.userId, session.sessionId);
    const toolInstance = new (toolType as any)(runtime, session) as Tool;
    const result = toolInstance.invoke(request.toolParameters);
    if (result instanceof Promise) {
      const resolved = await result;
      if (Array.isArray(resolved)) {
        for (const item of resolved) {
          yield item;
        }
      } else {
        yield resolved;
      }
    } else if (Symbol.asyncIterator in result) {
      for await (const chunk of result) {
        yield chunk;
      }
    } else if (Symbol.iterator in result) {
      for (const chunk of result) {
        yield chunk;
      }
    } else {
      yield result;
    }
  }

  async validateToolProviderCredentials(
    session: Session,
    request: ToolValidateCredentialsRequest,
  ): Promise<any> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      Logger.error(`Tool provider not found: ${request.provider}`);
      return;
    }
    await providerInstance.validateCredentials(request.credentials);
    return { result: true };
  }

  async *invokeAgentStrategy(
    session: Session,
    request: AgentInvokeRequest,
  ): AsyncGenerator<any> | Promise<HandleResult> {
    const agentRegistration = this.registry.getAgentStrategyRegistration(request.agentStrategyProvider, request.agentStrategy);
    if (agentRegistration?.cpuBound) {
      return { taskType: TaskType.CPU };
    }
    const agentClass = agentRegistration?.providerClassType;
    if (!agentClass) {
      Logger.error(`Agent '${request.agentStrategy}' not found for provider '${request.agentStrategyProvider}'`);
      return;
    }

    const runtime = new AgentRuntime(request.userId);
    const agentInstance: AgentStrategy = new (agentClass as any)(runtime, session);
    const result = agentInstance.invoke(request.agentStrategyParameters);
    if (result instanceof Promise) {
      const resolved = await result;
      if (Array.isArray(resolved)) {
        for (const item of resolved) {
          yield item;
        }
      } else {
        yield resolved;
      }
    } else if (Symbol.asyncIterator in result) {
      for await (const chunk of result) {
        yield chunk;
      }
    } else if (Symbol.iterator in result) {
      for (const chunk of result) {
        yield chunk;
      }
    } else {
      yield result;
    }
  }

  async getToolRuntimeParameters(
    session: Session,
    request: ToolGetRuntimeParametersRequest,
  ): Promise<HandleResult> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      Logger.error(`Tool provider not found: ${request.provider}`);
      return this.wrapIOResult({});
    }

    const toolRegistration = this.registry.getToolClassRegistration(request.provider, request.tool);
    if (toolRegistration?.cpuBound) {
      return { taskType: TaskType.CPU };
    }
    const toolType = toolRegistration?.toolClassType;
    if (!toolType) {
      Logger.error(`Tool not found: ${request.tool} for provider: ${request.provider}`);
      return this.wrapIOResult({});
    }

    const runtime = new ToolRuntime(request.credentials, undefined, request.userId, session.sessionId);
    const toolInstance = new (toolType as any)(runtime, session) as Tool;
    const parameters = await toolInstance.getRuntimeParameters();
    return this.wrapIOResult({ parameters });
  }

  async validateModelProviderCredentials(
    session: Session,
    request: ModelValidateProviderCredentialsRequest,
  ): Promise<any> {
    const modelProviderInstance = this.registry.getModelProviderInstance(request.provider);
    if (!modelProviderInstance) {
      Logger.error(`ModelProvider instance not found: ${request.provider}`);
      return;
    }
    await modelProviderInstance.validateProviderCredentials(request.credentials);
    return { result: true, credentials: request.credentials };
  }

  async validateModelCredentials(
    session: Session,
    request: ModelValidateModelCredentialsRequest,
  ): Promise<any> {
    const modelProviderInstance = this.registry.getModelProviderInstance(request.provider);
    if (!modelProviderInstance) {
      Logger.error(`ModelProvider instance not found: ${request.provider}`);
      return;
    }
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    await modelInstance.validateCredentials(request.model, request.credentials);
    return { result: true, credentials: request.credentials };
  }

  async invokeLLM(
    session: Session,
    request: ModelInvokeLLMRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isLargeLanguageModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    return modelInstance.invoke(
      request.model,
      request.credentials,
      request.promptMessages,
      request.modelParameters,
      request.tools,
      request.stop,
      request.stream,
      request.userId,
    );
  }

  async getLLMNumTokens(
    session: Session,
    request: ModelGetLLMNumTokensRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isLargeLanguageModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    const numTokens = await modelInstance.getNumTokens(
      request.model,
      request.credentials,
      request.promptMessages,
      request.tools,
    );
    return { numTokens };
  }

  async invokeTextEmbedding(
    session: Session,
    request: ModelInvokeTextEmbeddingRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isTextEmbeddingModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    return modelInstance.invoke(
      request.model,
      request.credentials,
      request.texts,
      request.userId,
      EmbeddingInputType.DOCUMENT,
    );
  }

  async getTextEmbeddingNumTokens(
    session: Session,
    request: ModelGetTextEmbeddingNumTokensRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isTextEmbeddingModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    const numTokens = await modelInstance.getNumTokens(
      request.model,
      request.credentials,
      request.texts,
    );
    return { numTokens };
  }

  async invokeRerank(
    session: Session,
    request: ModelInvokeRerankRequest
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isRerankModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }

    return modelInstance.invoke(
      request.model,
      request.credentials,
      request.query,
      request.docs,
      request.scoreThreshold,
      request.topN,
      request.userId,
    );
  }

  async* invokeTTS(
    session: Session,
    request: ModelInvokeTTSRequest,
  ): AsyncGenerator<{ result: string }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isTTSModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    const result = modelInstance.invoke(
      request.model,
      request.tenantId,
      request.credentials,
      request.contentText,
      request.voice,
      request.userId,
    );
    if (result instanceof Promise) {
      const buffer = await result;
      if (Buffer.isBuffer(buffer)) {
        yield { result: bufferToHex(buffer) };
      } else {
        for (const chunk of buffer) {
          if (Buffer.isBuffer(chunk)) {
            yield { result: bufferToHex(chunk) };
          }
        }
      }
    } else if (Symbol.asyncIterator in result) {
      for await (const chunk of result) {
        if (Buffer.isBuffer(chunk)) {
          yield { result: bufferToHex(chunk) };
        }
      }
    } else if (Symbol.iterator in result) {
      for (const chunk of result) {
        if (Buffer.isBuffer(chunk)) {
          yield { result: bufferToHex(chunk) };
        }
      }
    } else {
      if (Buffer.isBuffer(result)) {
        yield { result: bufferToHex(result) };
      }
    }
  }

  async getTTSVoices(
    session: Session,
    request: ModelGetTTSVoicesRequest,
  ): Promise<{ voices: any[] }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isTTSModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return { voices: [] };
    }
    const voices = modelInstance.getTTSModelVoices(
      request.model,
      request.credentials,
      request.language,
    );
    return { voices: voices ? voices : [] };
  }

  async invokeSpeech2Text(
    session: Session,
    request: ModelInvokeSpeech2TextRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isSpeech2TextModel(modelInstance)) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    const result = await modelInstance.invoke(
      request.model,
      request.credentials,
      request.file,
      request.userId,
    );
    return { result };
  }

  async getAIModelSchemas(
    session: Session,
    request: ModelGetAIModelSchemasRequest,
  ): Promise<any> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !modelInstance.getModelSchema) {
      Logger.error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
      return;
    }
    const modelSchema = await modelInstance.getModelSchema(
      request.model,
      request.credentials,
    );
    return { modelSchema: modelSchema || null };
  }

  async* invokeEndpoint(
    session: Session,
    request: EndpointInvokeRequest,
  ): AsyncGenerator<any> {
    const requestParsed = parseRawHttpRequest(request.rawHttpRequest);

    try {
      const { endpoint, values } = this.registry.dispatchEndpointRequest(requestParsed);
      const endpointInstance = new (endpoint?.endpointClassType as any)(session) as Endpoint;
      const result = await endpointInstance.invoke(
        requestParsed,
        values,
        request.settings || {},
      );
      if (result instanceof Promise) {
        const resolved = await result;
        if (Array.isArray(resolved)) {
          for (const item of resolved) {
            yield item;
          }
        } else {
          yield resolved;
        }
      } else if (Symbol.asyncIterator in result) {
        for await (const chunk of result) {
          yield chunk;
        }
      } else if (Symbol.iterator in result) {
        for (const chunk of result) {
          yield chunk;
        }
      } else {
        yield result;
      }
    } catch (err: any) {
      Logger.error(`invoke endpoint error: ${err.message}`);
    }
  }

  async getOAuthAuthorizationUrl(
    session: Session,
    request: OAuthGetAuthorizationUrlRequest,
  ): Promise<any> {
    const providerClassType = this.registry.getOAuthProviderClassType(request.provider);
    if (!providerClassType) {
      Logger.error(`OAuth provider not found: ${request.provider}`);
      return;
    }
    const providerInstance = new (providerClassType as any)() as OAuthProvider;
    const authorizationUrl = providerInstance.oauthGetAuthorizationurl(
      request.redirectUri,
      request.systemCredentials,
    );
    return { authorizationUrl };
  }

  async getOAuthCredentials(
    session: Session,
    request: OAuthGetCredentialsRequest,
  ): Promise<{
    metadata: Record<string, any>;
    credentials: Record<string, any>;
    expiresAt?: string | number | undefined
  }> {
    const providerClassType = this.registry.getOAuthProviderClassType(request.provider);
    if (!providerClassType) {
      Logger.error(`OAuth provider not found: ${request.provider}`);
      return { metadata: {}, credentials: {} };
    }
    const providerInstance = new (providerClassType as any)() as OAuthProvider;
    const requestParsed = parseRawHttpRequest(request.rawHttpRequest);
    const credentials = await providerInstance.oauthGetCredentials(
      request.redirectUri,
      request.systemCredentials || {},
      requestParsed,
    );
    return {
      metadata: credentials.metadata || {},
      credentials: credentials.credentials,
      expiresAt: credentials.expiresAt
    };
  }

  async refreshOAuthCredentials(
    session: Session,
    request: OAuthRefreshCredentialsRequest,
  ): Promise<any> {
    const providerClassType = this.registry.getOAuthProviderClassType(request.provider);
    if (!providerClassType) {
      Logger.error(`OAuth provider not found: ${request.provider}`);
      return;
    }
    const providerInstance = new (providerClassType as any)() as OAuthProvider;
    const refreshed = await providerInstance.oauthRefreshCredentials(
      request.redirectUri,
      request.systemCredentials || {},
      request.credentials,
    );
    return {
      metadata: {},
      credentials: refreshed.credentials,
      expiresAt: refreshed.expiresAt,
    };
  }

  async fetchDynamicParameterOptions(
    session: Session,
    request: DynamicParameterFetchParameterOptionsRequest,
  ): Promise<any> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      Logger.error(`Tool provider not found: ${request.provider}`);
      return;
    }

    const toolRegistration = this.registry.getToolClassRegistration(request.provider, request.providerAction);
    const toolType = toolRegistration?.toolClassType;
    if (!toolType) {
      Logger.error(`Tool not found: ${request.providerAction} for provider: ${request.provider}`);
      return;
    }

    const runtime = new ToolRuntime(request.credentials, undefined, request.userId, session.sessionId);
    const toolInstance = new (toolType as any)(runtime, session) as Tool;
    if (!(toolInstance instanceof DynamicSelect)) {
      Logger.error(`Tool '${request.providerAction}' is not a DynamicSelect tool`);
      return;
    }
    const toolInstanceDynamicSelect = toolInstance as DynamicSelect;
    const options = await toolInstanceDynamicSelect.fetchParameterOptions(request.parameter);
    return options;
  }

  private isLargeLanguageModel(obj: any): obj is LargeLanguageModel {
    return obj &&
      typeof obj.invoke === 'function' &&
      typeof obj.getNumTokens === 'function' &&
      obj.modelType === ModelType.LLM;
  }

  private isTextEmbeddingModel(obj: any): obj is TextEmbeddingModel {
    return obj &&
      typeof obj.invoke === 'function' &&
      typeof obj.getNumTokens === 'function' &&
      obj.modelType === ModelType.TEXT_EMBEDDING;
  }

  private isRerankModel(obj: any): obj is RerankModel {
    return obj &&
      typeof obj.invoke === 'function' &&
      obj.modelType === ModelType.RERANK;
  }

  private isTTSModel(obj: any): obj is TTSModel {
    return obj &&
      typeof obj.invoke === 'function' &&
      obj.modelType === ModelType.TTS;
  }

  private isSpeech2TextModel(obj: any): obj is Speech2TextModel {
    return obj &&
      typeof obj.invoke === 'function' &&
      obj.modelType === ModelType.SPEECH2TEXT;
  }
}