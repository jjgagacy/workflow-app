import { PluginConfig } from "@/config/config";
import { PluginRegistry } from "./plugin-registry";
import { Session } from "@/core/classes/runtime";
import { ToolInvokeRequest } from "@/core/entities/plugin/request/tool.request";

export class PluginExecutor {
  constructor(
    private config: PluginConfig,
    private registry: PluginRegistry
  ) { }

  async* invokeTool(
    session: Session,
    request: ToolInvokeRequest
  ): AsyncGenerator<any> {
    const providerInstance = this.registry.getToolProviderCls(request.provider);
    if (!providerInstance) {
      throw new Error(`Tool provider not found: ${request.provider}`);
    }

    const toolInstance = this.registry.getToolCls(request.provider, request.tool);
    if (!toolInstance) {
      throw new Error(`Tool not found: ${request.tool} for provider: ${request.provider}`);
    }

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
    data: ToolValidateCredentialsRequest,
  ): Promise<{ result: boolean; }> {
    throw new Error('Not impl');
  }

  async *invokeAgentStrategy(
    session: Session,
    request: any
  ): AsyncGenerator<any> {
    throw new Error('Not impl');
  }

  async getToolRuntimeParameters(
    session: Session,
    data: any,
  ): Promise<{ parameters: any[] }> {
    throw new Error(`Not impl`);
  }

  async validateModelProviderCredentials(
    session: Session,
    data: any,
  ): Promise<{ result: boolean; credentials: Record<string, any> }> {
    throw new Error(`Not impl`);
  }

  async validateModelCredentials(
    session: Session,
    data: any,
  ): Promise<{ result: boolean; credentials: Record<string, any> }> {
    throw new Error(`Not impl`);
  }

  async invokeLLM(
    session: Session,
    data: any,
  ): Promise<any> {
    throw new Error(`Not impl`);
  }

  async getLLMNumTokens(
    session: Session,
    data: any,
  ): Promise<{ numTokens: number }> {
    throw new Error(`Not impl`);
  }

  async invokeTextEmbedding(
    session: Session,
    data: any,
  ): Promise<any> {
    throw new Error(`Not impl`);
  }

  async getTextEmbeddingNumTokens(
    session: Session,
    data: any,
  ): Promise<{ numTokens: number }> {
    throw new Error(`Not impl`);
  }

  async invokeRerank(
    session: Session,
    data: any
  ): Promise<any> {
    throw new Error('Not impl');
  }

  async* invokeTTS(
    session: Session,
    data: any,
  ): AsyncGenerator<{ result: string }> {
    throw new Error('Not impl');
  }

  async getTTSVoices(
    session: Session,
    data: any,
  ): Promise<{ voices: any[] }> {
    throw new Error('Not impl');
  }

  async invokeSpeechToText(
    session: Session,
    data: any,
  ): Promise<{ result: string; }> {
    throw new Error('Not impl');
  }

  async getAIModelSchemas(
    session: Session,
    data: any,
  ): Promise<{ modelSchema: any }> {
    throw new Error('Not impl');
  }
}
