import { PluginConfig } from "@/config/config";
import { PluginRegistry } from "./plugin-registry";
import { Session } from "@/core/classes/runtime";
import { ToolGetRuntimeParametersRequest, ToolInvokeRequest, ToolValidateCredentialsRequest } from "@/core/entities/plugin/request/tool.request";
import { AgentInvokeRequest } from "@/core/entities/plugin/request/agent.request";
import { ModelGetAIModelSchemasRequest, ModelGetLLMNumTokensRequest, ModelGetTextEmbeddingNumTokensRequest, ModelGetTTSVoicesRequest, ModelInvokeLLMRequest, ModelInvokeRerankRequest, ModelInvokeSpeech2TextRequest, ModelInvokeTextEmbeddingRequest, ModelInvokeTTSRequest, ModelValidateModelCredentialsRequest, ModelValidateProviderCredentialsRequest } from "@/core/entities/plugin/request/model.request";
import { EndpointInvokeRequest } from "@/core/entities/plugin/request/endpoint.request";
import { OAuthGetAuthorizationUrlRequest, OAuthGetCredentialsRequest, OAuthRefreshCredentialsRequest } from "@/core/entities/plugin/request/oauth.request";
import { DynamicParameterFetchParameterOptionsRequest } from "@/core/entities/plugin/request/dynamic-parameter";
import { DynamicSelect } from "@/interfaces/dynamic-select/dynamic-select";
import { AgentRuntime, AgentStrategy } from "@/interfaces/agent/agent-strategy";
import { Tool, ToolRuntime } from "@/interfaces/tool/tool";
import { LargeLanguageModel } from "@/interfaces/model/llm.model";
import { TextEmbeddingModel } from "@/interfaces/model/text-embedding.model";
import { ModelType } from "@/core/entities/enums/model.enum";
import { EmbeddingInputType } from "@/core/entities/model/text-embedding.entity";
import { RerankModel } from "@/interfaces/model/rerank.model";
import { TTSModel } from "@/interfaces/model/tts.model";
import { bufferToHex } from "@/utils/buffer.util";
import { Speech2TextModel } from "@/interfaces/model/speech2text.model";
import { parseRawHttpRequest } from "@/core/entities/endpoint/endpoint.entity";
import { OAuthProvider } from "@/interfaces/oauth/oauth-provider";

export class PluginExecutor {
  constructor(
    private config: PluginConfig,
    private registry: PluginRegistry
  ) { }

  async* invokeTool(
    session: Session,
    request: ToolInvokeRequest
  ): AsyncGenerator<any> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      throw new Error(`Tool provider not found: ${request.provider}`);
    }

    const toolType = this.registry.getToolClassType(request.provider, request.tool);
    if (!toolType) {
      throw new Error(`Tool not found: ${request.tool} for provider: ${request.provider}`);
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
  ): Promise<{ result: boolean; }> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      throw new Error(`Tool provider not found: ${request.provider}`);
    }
    await providerInstance.validateCredentials(request.credentials);
    return { result: true };
  }

  async *invokeAgentStrategy(
    session: Session,
    request: AgentInvokeRequest,
  ): AsyncGenerator<any> {
    const agentClass = this.registry.getAgentStrategyClassType(request.agentStrategyProvider, request.agentStrategy);
    if (!agentClass) {
      throw new Error(`Agent '${request.agentStrategy}' not found for provider '${request.agentStrategyProvider}'`);
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
  ): Promise<{ parameters: any[] }> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      throw new Error(`Tool provider not found: ${request.provider}`);
    }

    const toolType = this.registry.getToolClassType(request.provider, request.tool);
    if (!toolType) {
      throw new Error(`Tool not found: ${request.tool} for provider: ${request.provider}`);
    }

    const runtime = new ToolRuntime(request.credentials, undefined, request.userId, session.sessionId);
    const toolInstance = new (toolType as any)(runtime, session) as Tool;
    const parameters = await toolInstance.getRuntimeParameters();
    return { parameters };
  }

  async validateModelProviderCredentials(
    session: Session,
    request: ModelValidateProviderCredentialsRequest,
  ): Promise<{ result: boolean; credentials: Record<string, any> }> {
    const modelProviderInstance = this.registry.getModelProviderInstance(request.provider);
    if (!modelProviderInstance) {
      throw new Error(`ModelProvider instance not found: ${request.provider}`);
    }
    await modelProviderInstance.validateProviderCredentials(request.credentials);
    return { result: true, credentials: request.credentials };
  }

  async validateModelCredentials(
    session: Session,
    request: ModelValidateModelCredentialsRequest,
  ): Promise<{ result: boolean; credentials: Record<string, any> }> {
    const modelProviderInstance = this.registry.getModelProviderInstance(request.provider);
    if (!modelProviderInstance) {
      throw new Error(`ModelProvider instance not found: ${request.provider}`);
    }
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance) {
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
  ): Promise<{ numTokens: number }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isLargeLanguageModel(modelInstance)) {
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
  ): Promise<{ numTokens: number }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isTextEmbeddingModel(modelInstance)) {
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
  ): Promise<{ result: string; }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !this.isSpeech2TextModel(modelInstance)) {
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
  ): Promise<{ modelSchema: any }> {
    const modelInstance = this.registry.getModelInstance(request.provider, request.modelType);
    if (!modelInstance || !modelInstance.getModelSchema) {
      throw new Error(`Model '${request.modelType}' not found for provider: '${request.provider}'`);
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
      const { endpoint: EndpointClass, values } = this.registry.dispatchEndpointRequest(requestParsed);
      const endpointInstance = new (EndpointClass as any)(session);
      const result = await endpointInstance.invoke(
        requestParsed,
        values,
        request.settings,
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
    } catch (err) {
      throw err;
    }
  }

  async getOAuthAuthorizationUrl(
    session: Session,
    request: OAuthGetAuthorizationUrlRequest,
  ): Promise<{ authorizationUrl: string }> {
    const providerClassType = this.registry.getOAuthProviderClassType(request.provider);
    if (!providerClassType) {
      throw new Error(`OAuth provider not found: ${request.provider}`);
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
      throw new Error(`OAuth provider not found: ${request.provider}`);
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
  ): Promise<{
    metadata: Record<string, any>;
    credentials: Record<string, any>;
    expiresAt?: string | number | undefined
  }> {
    const providerClassType = this.registry.getOAuthProviderClassType(request.provider);
    if (!providerClassType) {
      throw new Error(`OAuth provider not found: ${request.provider}`);
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
  ): Promise<any[] | null> {
    const providerInstance = this.registry.getToolProviderInstance(request.provider);
    if (!providerInstance) {
      throw new Error(`Tool provider not found: ${request.provider}`);
    }

    const toolType = this.registry.getToolClassType(request.provider, request.provider);
    if (!toolType) {
      throw new Error(`Tool not found: ${request.providerAction} for provider: ${request.provider}`);
    }

    const runtime = new ToolRuntime(request.credentials, undefined, request.userId, session.sessionId);
    const toolInstance = new (toolType as any)(runtime, session) as Tool;
    if (!(toolInstance instanceof DynamicSelect)) {
      throw new Error(`Tool '${request.providerAction}' is not a DynamicSelect tool`);
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