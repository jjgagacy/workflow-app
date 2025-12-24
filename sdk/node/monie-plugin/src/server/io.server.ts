import { PluginConfig } from "@/config/config";
import type { Server, ServerInfo } from "./server";
import { MessageCallback, RequestReader } from "@/core/reader.class";
import { ResponseWriter } from "@/core/writer.class";
import { StreamMessage } from "@/core/dtos/stream.dto";
import os from 'os';
import path from "path";
import { DynamicThreadPool } from "poolifier";
import { StreamRequestEvent } from "@/core/entities/event.enum";
import { TaskData, TaskResult } from "./workers/worker.type";
import { PluginRegistry } from "./plugin.registry";
import { PluginExecutor } from "./plugin.executor";
import { Router } from "./route/router";
import { PluginInvokeType } from "@/core/entities/enums/plugin.type";
import { AgentActions, EndpointActions, ModelActions, OAuthActions, ToolActions } from "@/core/entities/plugin/request/request";
import { ToolInvokeRequest, ToolValidateCredentialsRequest } from "@/core/entities/plugin/request/tool.request";
import { AgentInvokeRequest } from "@/core/entities/plugin/request/agent.request";
import { ModelGetAIModelSchemasRequest, ModelGetLLMNumTokensRequest, ModelGetTextEmbeddingNumTokensRequest, ModelInvokeLLMRequest, ModelInvokeRerankRequest, ModelInvokeSpeech2TextRequest, ModelInvokeTextEmbeddingRequest, ModelInvokeTTSRequest, ModelValidateModelCredentialsRequest, ModelValidateProviderCredentialsRequest } from "@/core/entities/plugin/request/model.request";
import { EndpointInvokeRequest } from "@/core/entities/plugin/request/endpoint.request";
import { DynamicParameterFetchParameterOptionsRequest } from "@/core/entities/plugin/request/dynamic-parameter";
import { OAuthGetAuthorizationUrlRequest, OAuthRefreshCredentialsRequest } from "@/core/entities/plugin/request/oauth.request";
import { Session } from "@/core/classes/runtime";
import { HandleResult, TaskType } from "./route/route.handler";

export class IOServer implements Server {
  private isRunning: boolean = false;
  private eventLoopPromise?: Promise<void>;
  private heartbeatPromise?: Promise<void>;
  private parentCheckPromise?: Promise<void>;
  private maxWorkers: number = Math.max(2, Math.floor(os.cpus().length / 2));
  private pool: DynamicThreadPool<TaskData, TaskResult> | null = null;
  private messageHandler?: (msg: StreamMessage) => Promise<any> | any;
  private registry: PluginRegistry;
  private pluginExecutor: PluginExecutor;
  private router: Router;

  constructor(
    protected config: PluginConfig,
    private reader: RequestReader,
    private writer?: ResponseWriter
  ) {
    this.isRunning = false;
    this.registry = new PluginRegistry(config);
    if (!this.config.disableWorker) {
      this.pool = new DynamicThreadPool(
        2,
        this.maxWorkers * 2,
        path.resolve(__dirname, 'workers/message.worker.js'),
        {
          errorHandler: (e) => {
            console.log('worker error: ', e);
          },
          onlineHandler: () => { },
        });
    }
    this.router = new Router(reader, writer);
    this.pluginExecutor = new PluginExecutor(this.config, this.registry);
    this.registerRoutes();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    const callback: MessageCallback = async (message) => {
      await this.dispatchMessage(message);
    };
    this.reader.onMessage(callback);

    try {
      this.eventLoopPromise = this.runEventLoop();
      if (this.writer) {
        this.heartbeatPromise = this.heartbeat();
      }
      if (this.reader.type === 'stdio') {
        this.parentCheckPromise = this.parentAliveCheck();
      }
      // 创建一个永不完成的 Promise，保持服务运行
      await this.keepAlive();
    } catch (error) {
      console.error('Service error:', error);
      console.error('Restarting...');
      await this.sleep(3000);
      await this.restart();
    }
  }

  private async runEventLoop(): Promise<void> {
    return this.reader.startEventLoop();
  }

  private async keepAlive(): Promise<never> {
    // KeepAlive Promise
    return new Promise<never>((_, reject) => {
      const cleanup = () => {
        this.isRunning = false;
        this.cleanup();
        reject(new Error('KeepAlive terminated'));
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      // if (!this.isRunning) cleanup();
    });
  }

  private async parentAliveCheck(): Promise<void> {
    while (this.isRunning) {
      console.log('check parent alive');
      if (process.ppid === 1) { // 父进程退出
        console.log('Parent process died, shutting down...');
        this.isRunning = false;
        this.cleanup();
      }
      await this.sleep(500);
    }
  }

  private async heartbeat(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.send_heartbeat();
        await this.sleep(2000);
      } catch (error) {
        console.error('Heartbeat error:', error);
        await this.sleep(1000);
      }
    }
  }

  private async send_heartbeat(): Promise<void> {
    console.log('Sending heartbeat...', new Date().toISOString());
    // 实际心跳逻辑
    await this.sleep(500); // 模拟网络延迟
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.cleanup();
  }

  handleRequest(request: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getServerInfo(): ServerInfo {
    return {
      workers: this.pool?.info
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async cleanup() {
    this.reader.stop();
    this.writer?.close();
    await this.sleep(2000);
    process.exit(-1);
  }

  private async restart(): Promise<void> {
    if (this.eventLoopPromise) {
      this.eventLoopPromise.catch(() => { }).finally(() => {
        this.eventLoopPromise = this.runEventLoop();
      })
    }

    if (this.heartbeatPromise) {
      this.heartbeatPromise.catch(() => { }).finally(() => {
        this.heartbeatPromise = this.heartbeat();
      });
    }

    if (this.parentCheckPromise) {
      this.parentCheckPromise.catch(() => { }).finally(() => {
        this.parentCheckPromise = this.parentAliveCheck();
      })
    }
  }

  // gracefulStop for testing only
  async gracefulStop(): Promise<void> {
    this.isRunning = false;
    this.cleanup();
  }

  private async processMessageWithWorker(message: StreamMessage): Promise<void> {
    if (!this.messageHandler) {
      console.warn("No message Handler registered.");
      return;
    }

    try {
      const taskData: TaskData = {
        messageId: message.sessionId,
        payload: message,
      };

      switch (message.event) {
        case StreamRequestEvent.REQUEST:
          const result = await this.pool?.execute(taskData);
          if (this.writer) {
            const response = { sessionId: message.sessionId, result };
            this.writer.write(JSON.stringify(response));
          }
          break;
        default:
          console.warn("Unknown message event: ", message.event)
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // 发送错误响应
    }
  }

  setHandler(handler: (msg: StreamMessage) => Promise<any>) {
    this.messageHandler = handler;
  }

  protected isCPUTask(message: StreamMessage): boolean {
    return false;
  }

  private async dispatchMessage(message: StreamMessage): Promise<void> {
    const session = new Session(
      message.sessionId,
      this.reader,
      this.writer,
      message.conversationId,
      message.messageId,
      message.appId,
      message.endpointId,
      message.context,
      this.config.pluginDaemonUrl,
    );

    if (this.isCPUTask(message)) {
      return this.handleCPUTask(message);
    }

    const handleResult = await this.router.dispatch(session, message.data);

    let result: unknown;
    if (handleResult) {
      if (handleResult instanceof Promise) {
        const resolved = (await handleResult) as HandleResult;
        if (resolved.taskType === TaskType.CPU) {
          return this.handleCPUTask(message);
        }
        result = resolved.result;
        await this.processAndSendMessage(session, result);
      } else if (Symbol.asyncIterator in handleResult) {
        for await (const item of handleResult) {
          await this.processAndSendMessage(session, item.result);
        }
      }
    }

    return this.handleIOTask(message);
  }

  private async processAndSendMessage(session: Session, result: any) {
    console.log("output message", result);

  }

  private async handleCPUTask(message: StreamMessage): Promise<void> {
    try {
      const taskData: TaskData = {
        messageId: message.sessionId,
        payload: message,
      };

      switch (message.event) {
        case StreamRequestEvent.REQUEST:
          const result = await this.pool?.execute(taskData);
          if (this.writer) {
            const response = { sessionId: message.sessionId, result };
            this.writer.write(JSON.stringify(response));
          }
          break;
        default:
          console.warn("Unknown message event: ", message.event)
      }
    } catch (error) {
      console.error('Error cpu task processing message:', error);
      // 发送错误响应
    }
  }

  private async handleIOTask(message: StreamMessage): Promise<void> {
    if (!this.messageHandler) {
      console.warn("No message Handler registered.");
      return;
    }

    try {
      const result = await this.messageHandler!(message);
      if (this.writer) {
        this.writer.write(JSON.stringify({
          sessionId: message.sessionId, result
        }));
      }
    } catch (error) {
      console.error('Error io task processing message:', error);
      // 发送错误响应
    }
  }

  private registerRoutes() {
    this.router.registerRoute<ToolInvokeRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Tool &&
        data.action === ToolActions.InvokeTool,
      (data: any) => data as ToolInvokeRequest,
      this.pluginExecutor.invokeTool.bind(this.pluginExecutor)
    );

    this.router.registerRoute<ToolValidateCredentialsRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Tool &&
        data.action === ToolActions.ValidateCredentials,
      (data: any) => data as ToolValidateCredentialsRequest,
      this.pluginExecutor.validateToolProviderCredentials.bind(this.pluginExecutor),
    );

    this.router.registerRoute<AgentInvokeRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Agent &&
        data.action === AgentActions.InvokeAgentStrategy,
      (data: any) => data as AgentInvokeRequest,
      this.pluginExecutor.invokeAgentStrategy.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelInvokeLLMRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.InvokeLLM,
      (data: any) => data as ModelInvokeLLMRequest,
      this.pluginExecutor.invokeLLM.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelGetLLMNumTokensRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.GetLLMNumTokens,
      (data: any) => data as ModelGetLLMNumTokensRequest,
      this.pluginExecutor.getLLMNumTokens.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelInvokeTextEmbeddingRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.InvokeTextEmbedding,
      (data: any) => data as ModelInvokeTextEmbeddingRequest,
      this.pluginExecutor.invokeTextEmbedding.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelGetTextEmbeddingNumTokensRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.GetTextEmbeddingNumTokens,
      (data: any) => data as ModelGetTextEmbeddingNumTokensRequest,
      this.pluginExecutor.getTextEmbeddingNumTokens.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelInvokeRerankRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.InvokeRerank,
      (data: any) => data as ModelInvokeRerankRequest,
      this.pluginExecutor.invokeRerank.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelInvokeTTSRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.InvokeRerank,
      (data: any) => data as ModelInvokeTTSRequest,
      this.pluginExecutor.invokeTTS.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelInvokeSpeech2TextRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.InvokeSpeech2Text,
      (data: any) => data as ModelInvokeSpeech2TextRequest,
      this.pluginExecutor.invokeSpeech2Text.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelValidateProviderCredentialsRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.ValidateProviderCredentials,
      (data: any) => data as ModelValidateProviderCredentialsRequest,
      this.pluginExecutor.validateModelProviderCredentials.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelValidateModelCredentialsRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.ValidateModelCredentials,
      (data: any) => data as ModelValidateModelCredentialsRequest,
      this.pluginExecutor.validateModelCredentials.bind(this.pluginExecutor),
    );

    this.router.registerRoute<ModelGetAIModelSchemasRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Model &&
        data.action === ModelActions.GetAIModelSchemas,
      (data: any) => data as ModelGetAIModelSchemasRequest,
      this.pluginExecutor.getAIModelSchemas.bind(this.pluginExecutor),
    );

    this.router.registerRoute<EndpointInvokeRequest>(
      (data: any) =>
        data.type === PluginInvokeType.Endpoint &&
        data.action === EndpointActions.InvokeEndpoint,
      (data: any) => data as EndpointInvokeRequest,
      this.pluginExecutor.invokeEndpoint.bind(this.pluginExecutor),
    );

    this.router.registerRoute<DynamicParameterFetchParameterOptionsRequest>(
      (data: any) =>
        data.type === PluginInvokeType.DynamicParameter &&
        data.action === EndpointActions.InvokeEndpoint,
      (data: any) => data as DynamicParameterFetchParameterOptionsRequest,
      this.pluginExecutor.fetchDynamicParameterOptions.bind(this.pluginExecutor),
    );

    this.router.registerRoute<OAuthGetAuthorizationUrlRequest>(
      (data: any) =>
        data.type === PluginInvokeType.OAuth &&
        data.action === OAuthActions.GetAuthorizationUrl,
      (data: any) => data as OAuthGetAuthorizationUrlRequest,
      this.pluginExecutor.getOAuthAuthorizationUrl.bind(this.pluginExecutor),
    );

    this.router.registerRoute<OAuthRefreshCredentialsRequest>(
      (data: any) =>
        data.type === PluginInvokeType.OAuth &&
        data.action === OAuthActions.RefreshCredentials,
      (data: any) => data as OAuthRefreshCredentialsRequest,
      this.pluginExecutor.refreshOAuthCredentials.bind(this.pluginExecutor),
    );
  }
}
