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
import { ModelProvider } from "@/interfaces/model/model-provider";
import { LargeLanguageModel } from "@/interfaces/model/llm.model";

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
    throw new Error(`Not impl`);
  }

  async invokeTextEmbedding(
    session: Session,
    request: ModelInvokeTextEmbeddingRequest,
  ): Promise<any> {
    throw new Error(`Not impl`);
  }

  async getTextEmbeddingNumTokens(
    session: Session,
    request: ModelGetTextEmbeddingNumTokensRequest,
  ): Promise<{ numTokens: number }> {
    throw new Error(`Not impl`);
  }

  async invokeRerank(
    session: Session,
    request: ModelInvokeRerankRequest
  ): Promise<any> {
    throw new Error('Not impl');
  }

  async* invokeTTS(
    session: Session,
    request: ModelInvokeTTSRequest,
  ): AsyncGenerator<{ result: string }> {
    throw new Error('Not impl');
  }

  async getTTSVoices(
    session: Session,
    request: ModelGetTTSVoicesRequest,
  ): Promise<{ voices: any[] }> {
    throw new Error('Not impl');
  }

  async invokeSpeech2Text(
    session: Session,
    request: ModelInvokeSpeech2TextRequest,
  ): Promise<{ result: string; }> {
    throw new Error('Not impl');
  }

  async getAIModelSchemas(
    session: Session,
    request: ModelGetAIModelSchemasRequest,
  ): Promise<{ modelSchema: any }> {
    throw new Error('Not impl');
  }

  async* invokeEndpoint(
    session: Session,
    request: EndpointInvokeRequest,
  ): AsyncGenerator<any> {
    throw new Error('Not impl');
  }

  async getOAuthAuthorizationUrl(
    session: Session,
    request: OAuthGetAuthorizationUrlRequest,
  ): Promise<{ authorizationUrl: string }> {
    throw new Error('Not impl');
  }

  async getOAuthCredentials(
    session: Session,
    request: OAuthGetCredentialsRequest,
  ): Promise<{
    metadata: Record<string, any>;
    credentials: Record<string, any>;
    expireAt?: string | number;
  }> {
    throw new Error('Not impl');
  }

  async refreshOAuthCredentials(
    session: Session,
    request: OAuthRefreshCredentialsRequest,
  ): Promise<{
    metadata: Record<string, any>;
    credentials: Record<string, any>;
  }> {
    throw new Error('Not impl');
  }

  async fetchDynamicParameterOptions(
    session: Session,
    request: DynamicParameterFetchParameterOptionsRequest,
  ): Promise<DynamicSelect | null> {
    throw new Error('Not impl');
  }

  private isLargeLanguageModel(obj: any): obj is LargeLanguageModel {
    return obj && typeof obj.invoke === 'function' && typeof obj.getNumTokens === 'function';
  }
}
