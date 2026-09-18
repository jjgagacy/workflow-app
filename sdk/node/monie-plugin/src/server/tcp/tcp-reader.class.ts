import { EventEmitter } from 'events';
import { RequestReader } from '../../core/reader.class.js';
import { StreamWriter } from '../../core/streams/stream.js';
import { SessionMessage, SessionMessageType } from '../../core/entities/event/message.js';
import { Event, StreamOutputMessage } from '../../core/entities/event/writer-entities.js';
import { StreamMessage } from '../../core/dtos/stream.dto.js';
import * as net from 'node:net';
import { Logger } from '../../config/logger.js';
import { AsyncMessageQueue } from './async-message-queue.class.js';
import { StreamRequestEvent } from '../../core/entities/event.enum.js';
import { deepCamelToSnake, deepSnakeToCamel } from '../../utils/string.util.js';
import { PluginRegistry } from '../plugin.registry.js';
import { InitializeMessage, InitializeMessageType } from '../../core/entities/event/message.js';

function toPlainObject(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toPlainObject);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const plain: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      plain[key] = toPlainObject(item);
    }
    return plain;
  }

  return value;
}

interface TCPReaderWriterOptions {
  host: string;
  port: number;
  key: string;
  reconnectAttempts?: number;
  reconnectTimeout?: number;
  onConnected?: (transport: StreamWriter) => Promise<void> | void;
}


export class TCPReaderWriter extends RequestReader implements StreamWriter {
  private host: string;
  private port: number;
  private key: string;
  private reconnectAttempts: number;
  private reconnectTimeoutMs: number;
  private onConnected: ((transport: StreamWriter) => Promise<void> | void) | undefined;

  private socket: net.Socket | null = null;
  private alive: boolean = false;
  private buffer: string = '';
  private currentAttempts: number = 0;
  private isConnecting: boolean = false;

  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnecting = false;
  private readonly messageQueue = new AsyncMessageQueue<StreamMessage>();

  constructor(options: TCPReaderWriterOptions) {
    super('remote');
    this.host = options.host;
    this.port = options.port;
    this.key = options.key;
    this.reconnectAttempts = options.reconnectAttempts ?? 3;
    this.reconnectTimeoutMs = (options.reconnectTimeout ?? 5) * 1000;
    this.onConnected = options.onConnected;
  }

  /**
   * RequestReader 使用这个 AsyncGenerator 来异步读取流消息。
   */
  async *readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown> {
    for await (const message of this.messageQueue) {
      yield message;
    }
  }

  write(data: string): Promise<void> {
    if (!this.socket || !this.alive) {
      return Promise.reject(new Error('Socket is not connected'));
    }
    return new Promise((resolve, reject) => {
      this.socket!.write(data, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * 主动关闭 TCP 连接
   * @returns 
   */
  async close(): Promise<void> {
    this.alive = false;
    this.reconnecting = false;
    this.isConnecting = false;

    this.clearReconnectTimer();
    const socket = this.socket;

    if (!socket) {
      this.messageQueue.close();
      return Promise.resolve();
    }

    this.socket = null;

    await new Promise<void>((resolve) => {
      if (socket.destroyed) {
        resolve();
        return;
      }
      socket.once('close', () => {
        resolve();
      });
      socket.destroy();
    });
    this.messageQueue.close();
  }

  /**
   * 建立 TCP 连接
   * @returns 
   */
  private connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      this.socket = socket;
      this.buffer = '';

      socket.connect(this.port, this.host, () => {
        // 如果这个socket 不是当前的 socket，说明已经有新的连接在进行，销毁这个旧的socket
        if (this.socket != socket) {
          socket.destroy();
          return;
        }
        this.alive = true;
        this.reconnecting = true;

        // Send handshake message
        const handshakeMessage = {
          type: 'handshake',
          data: { key: this.key },
        };
        socket.write(JSON.stringify(handshakeMessage) + '\n', async err => {
          if (err) {
            reject(err);
            return;
          }

          try {
            Logger.info(`\x1b[32mConnected to ${this.host}:${this.port}\x1b[0m`);
            await this.onConnected?.(this);
            Logger.info(`Sent key to ${this.host}:${this.port}`);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      socket.on('data', (chunk: Buffer) => {
        // Logger.info(`Received data: ${chunk.toString('utf-8')}`);
        if (this.socket != socket) {
          return;
        }
        this.handleData(chunk);
      });

      socket.on('error', (err: any) => {
        if (this.socket != socket) {
          return;
        }
        Logger.error(`\x1b[31mSocket error on ${this.host}:${this.port}\x1b[0m` + err.message);
        if (!this.alive) {
          reject(err);
          return;
        }
        this.handleReconnection();
      });

      socket.on('close', () => {
        if (this.socket != socket) {
          return;
        }
        this.socket = null;
        const wasAlive = this.alive;
        this.alive = false;
        if (wasAlive) {
          Logger.warn('Socket closed unexpectedly. Attempting reconnect...');
          this.handleReconnection();
        }
      });
    });
  }

  /**
   * 启动 TCP 连接
   * @returns 
   */
  public launch(): void {
    if (this.alive || this.isConnecting)
      return;
    this.connectWithRetry();
  }

  public isConnected(): boolean {
    return this.alive && this.socket !== null;
  }

  public onConnection(callback: (transport: StreamWriter) => Promise<void> | void): void {
    this.onConnected = callback;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private connectWithRetry(): void {
    if (
      this.isConnecting ||
      this.alive ||
      this.reconnecting
    ) {
      return;
    }

    this.isConnecting = true;

    const attemptConnect = () => {
      this.connect()
        .then(() => {
          this.isConnecting = false;
          this.reconnecting = false;
          this.currentAttempts = 0;
        })
        .catch(err => {
          const message =
            err instanceof Error
              ? err.message
              : String(err);
          Logger.error(`\x1b[31mConnection failed to ${this.host}:${this.port}\x1b[0m` + message);
          this.currentAttempts++;
          if (this.currentAttempts >= this.reconnectAttempts) {
            this.isConnecting = false;
            this.reconnecting = false;
            this.emit('tcp.connect.error', new Error(`Exceeded max reconnect attempts (${this.reconnectAttempts})`));
            return;
          }

          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            attemptConnect();
          }, this.reconnectTimeoutMs);
        })
        .finally(() => {
          this.isConnecting = false;
        });
    }
    attemptConnect();
  }

  /**
   * TCP 数据处理
   * TCP 没有消息边界，所以必须手动处理 framing
   * @param chunk 
   */
  private handleData(chunk: Buffer): void {
    this.buffer += chunk.toString('utf-8');
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // 保留“尚未接收完整的下一条消息”。

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine)
        continue;
      try {
        const rawData = JSON.parse(trimmedLine);

        if (
          typeof rawData !== 'object' ||
          rawData === null
        ) {
          Logger.warn(
            `Ignoring invalid TCP message: ${trimmedLine}`,
          );
          continue;
        }
        const data = rawData as Record<string, unknown>;
        const streamMessage: StreamMessage = {
          sessionId: data.session_id as string,
          conversationId: data.conversation_id as | string | undefined,
          messageId: data.message_id as | string | undefined,
          appId: data.app_id as string | undefined,
          endpointId: data.endpointId as | string | undefined,
          event: StreamRequestEvent.REQUEST, // data.event as string,
          data: deepSnakeToCamel(data.data) as any,
          context: data.context as any,
        };

        this.messageQueue.push(streamMessage);
        this.emit('tcp.data', streamMessage);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : String(err);
        Logger.error(`Failed to parse TCP message: ${message}`);
        this.emit('tcp.message.parse.error', {
          line: trimmedLine,
          err
        });
      }
    }
  }

  private handleReconnection(): void {
    this.close();
    this.connectWithRetry();
  }

  // 
  // StreamWriter
  //

  put(event: Event, sessionId?: string | null, data?: Record<string, any> | null): void {
    const message = new StreamOutputMessage(event, sessionId, data);
    const payload = deepCamelToSnake({
      event: message.event,
      sessionId: message.sessionId,
      data: message.data,
    });

    console.log('==write', JSON.stringify(payload));

    void this.write(
      JSON.stringify(payload) + '\n\n',
    ).catch(err => {
      Logger.error(
        `Failed to write stream event: ${err instanceof Error
          ? err.message
          : String(err)
        }`,
      );

      this.emit('tcp.writer.error', {
        event,
        sessionId,
        data,
        err,
      });
    })
  }

  error(sessionId?: string | null, data?: Record<string, any> | null): void {
    this.put(Event.ERROR, sessionId, data);
  }

  log(data: Record<string, any> | null): void {
    this.put(Event.LOG, null, data);
  }

  heartbeat(): void {
    this.put(Event.HEARTBEAT);
  }

  sessionMessage(sessionId?: string | null, data?: Record<string, any> | null): void {
    this.put(
      Event.SESSION,
      sessionId,
      data,
    );
  }

  sessionMessageText(sessionId?: string | null, data?: Record<string, any> | null): string {
    const message = new StreamOutputMessage(
      Event.SESSION,
      sessionId,
      data,
    );

    return (
      JSON.stringify(
        deepCamelToSnake({
          event: message.event,
          sessionId: message.sessionId,
          data: toPlainObject(message.data),
        }),
      ) + '\n\n'
    );
  }

  // 
  // SessionMessage
  //

  streamObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(
      SessionMessageType.STREAM,
      data,
    );
  }

  streamEndObject(): SessionMessage {
    return new SessionMessage(
      SessionMessageType.END,
      {},
    );
  }

  streamErrorObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(
      SessionMessageType.ERROR,
      data,
    );
  }

  streamInvokeObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(
      SessionMessageType.INVOKE,
      data,
    );
  }

  async initialize(registry: PluginRegistry): Promise<void> {
    const writeMessage = async (
      type: InitializeMessageType,
      data: Record<string, any> | any[],
    ): Promise<void> => {
      const message = new InitializeMessage(type, data);
      const payload = deepCamelToSnake({
        type: message.type,
        data: toPlainObject(message.data),
      });
      await this.write(`${JSON.stringify(payload)}\n\n`);
    };

    await writeMessage(InitializeMessageType.MANIFEST_DECLARATION, registry.declaration);

    const declarations: Array<[InitializeMessageType, Record<string, any>[]]> = [
      [InitializeMessageType.TOOL_DECLARATION, registry.toolProviderConfigurations],
      [InitializeMessageType.MODEL_DECLARATION, registry.modelProviderConfigurations],
      [InitializeMessageType.ENDPOINT_DECLARATION, registry.endpointProviderConfigurations],
      [InitializeMessageType.AGENT_STRATEGY_DECLARATION, registry.agentStrategyProviderConfigurations],
    ];

    for (const [type, data] of declarations) {
      if (data.length > 0) {
        await writeMessage(type, data);
      }
    }

    for (const file of registry.files) {
      const chunks = Math.max(1, Math.ceil(file.data.length / 8192));
      for (let sequence = 0; sequence < chunks; sequence++) {
        const chunk = file.data.subarray(sequence * 8192, (sequence + 1) * 8192);
        await writeMessage(
          InitializeMessageType.ASSET_CHUNK,
          {
            filename: file.filename,
            data: chunk.toString('base64'),
            end: sequence === chunks - 1,
          },
        );
      }
    }
    await writeMessage(InitializeMessageType.END, {});
  }
}