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

export class IOServer implements Server {
  private isRunning: boolean = false;
  private eventLoopPromise?: Promise<void>;
  private heartbeatPromise?: Promise<void>;
  private parentCheckPromise?: Promise<void>;
  private maxWorkers: number = Math.max(2, Math.floor(os.cpus().length / 2));
  private pool: DynamicThreadPool<TaskData, TaskResult>;
  private messageHandler?: (msg: StreamMessage) => Promise<any> | any;

  constructor(
    protected config: PluginConfig,
    private reader: RequestReader,
    private writer?: ResponseWriter
  ) {
    this.isRunning = false;
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
      await this.restart();
    }
  }

  private async runEventLoop(): Promise<void> {
    return this.reader.startEventLoop();
  }

  private async keepAlive(): Promise<never> {
    // 创建永不完成的 Promise
    return new Promise<never>(() => {
      // 什么都不做，永远等待
    });
  }

  private async parentAliveCheck(): Promise<void> {
    while (this.isRunning) {
      console.log('check parent alive');
      if (process.ppid === 1) { // 父进程退出
        console.log('Parent process died, shutting down...');
        this.isRunning = false;
        this.cleanup();
        process.exit(-1);
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
    throw new Error("Method not implemented.");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async cleanup() {
    this.reader.stop();
    this.writer?.close();
    await this.sleep(2000);
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
          const result = await this.pool.execute(taskData);
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

  status() {
    return {
      workers: this.pool.info
    }
  }

  setHandler(handler: (msg: StreamMessage) => Promise<any>) {
    this.messageHandler = handler;
  }

  protected isCpuTask(message: StreamMessage): boolean {
    return false;
  }

  private async dispatchMessage(message: StreamMessage): Promise<void> {
    if (!this.messageHandler) {
      console.warn("No message Handler registered.");
      return;
    }

    if (this.isCpuTask(message)) {
      return this.handleCpuTask(message);
    } else {
      return this.handleIoTask(message);
    }
  }

  private async handleCpuTask(message: StreamMessage): Promise<void> {
    try {
      const taskData: TaskData = {
        messageId: message.sessionId,
        payload: message,
      };

      switch (message.event) {
        case StreamRequestEvent.REQUEST:
          const result = await this.pool.execute(taskData);
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

  private async handleIoTask(message: StreamMessage): Promise<void> {
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

}
