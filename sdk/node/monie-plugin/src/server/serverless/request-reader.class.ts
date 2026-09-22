import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StreamMessage } from "../../core/dtos/stream.dto.js";
import { RequestReader } from "../../core/reader.class.js";
import { Readable } from 'stream';
import { ServerlessResponseWriter } from './response-writer.class.js';
import { StreamRequestEvent } from '../../core/entities/event.enum.js';
import { AsyncMessageQueue } from '../tcp/async-message-queue.class.js';
import { StreamRequestHandler } from './stream-request-handler.js';

export enum PluginInStreamEvent {
  INVOKE = "invoke",
  PING = "ping"
}

export interface PluginInStream extends StreamMessage {
}

export class ServerlessRequestReader extends RequestReader {
  private app: FastifyInstance;
  private host: string;
  private port: number;
  private maxSingleConnectionLifetime: number; // 单位：秒
  private readonly messageQueue = new AsyncMessageQueue<StreamMessage>();
  private readonly responseWriter: ServerlessResponseWriter;

  constructor(
    type: string,
    host: string = '0.0.0.0',
    port: number = 8080,
    maxSingleConnectionLifetime: number = 300,
    responseWriter: ServerlessResponseWriter = new ServerlessResponseWriter()
  ) {
    super(type);
    this.host = host;
    this.port = port;
    this.maxSingleConnectionLifetime = maxSingleConnectionLifetime;
    this.responseWriter = responseWriter;

    // 初始化 Fastify 实例
    this.app = Fastify({ logger: false });
    this.setupRoutes();
  }

  public async *readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown> {
    for await (const message of this.messageQueue) {
      yield message;
    }
  }

  private setupRoutes() {
    this.app.get('/health', this.handleHealth.bind(this));
    this.app.post('/invoke', this.handleInvoke.bind(this));
  }

  launch() {
    this.app.listen({ host: this.host, port: this.port }, (err, address) => {
      if (err) {
        this.app.log.error(err);
        process.exit(1);
      }
      this.app.log.info(`Server listening at ${address}`);
    });
  }

  private handleHealth(request: FastifyRequest, reply: FastifyReply) {
    reply.send({ status: 'ok' });
  }

  private handleInvoke(request: FastifyRequest, reply: FastifyReply) {
    return StreamRequestHandler.handle<Record<string, any>, PluginInStream>(
      request,
      reply,
      {
        responseWriter: this.responseWriter,
        maxSingleConnectionLifetime: this.maxSingleConnectionLifetime,
        extractSessionId: (body: Record<string, any>) => body.session_id,
        parseMessage: (body) => ({
          event: body.event as StreamRequestEvent,
          sessionId: body.session_id,
          conversationId: body.conversation_id,
          messageId: body.message_id,
          appId: body.app_id,
          endpointId: body.endpoint_id,
          data: body.data,
          context: body.context,
        }),
        dispatch: (message) => {
          this.messageQueue.push(message);
          this.emit('request', request);
        }
      },
    );
  }
}