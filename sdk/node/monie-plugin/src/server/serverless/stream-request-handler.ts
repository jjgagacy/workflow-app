import { FastifyReply, FastifyRequest } from "fastify";
import { ServerlessResponseWriter } from "./response-writer.class.js";
import { Readable } from "stream";

// 在 Serverless/HTTP 架构中，一个标准的 http 请求处理过程通常包含5个固定步骤（生命周期）
// 1. 参数解析与校验 (Extract & Validate Payload)
// 2. 响应头设置 (Setup HTTP Stream Headers)
// 3. Session 与流生命周期管理 (Stream & Timeout Lifecycle)
// 4. 消息派发/入队列 (Dispatch Message)
// 5. 异常与资源清理 (Cleanup & Error Handling)

// 我们可以抽象出一个模版方法模式 (Template Method Pattern) 的抽象处理类 (或者泛型函数)
// ，把通用的 http 流式管理逻辑封装起来，让具体的请求处理器只需关注业务数据解析与派发。

export interface StreamRequestOptions<TBody = any, TParsed = any> {
  // 核心依赖
  responseWriter: ServerlessResponseWriter;
  // 单位：秒
  maxSingleConnectionLifetime: number;
  // 1. 从 Body 提取 Session ID
  extractSessionId: (body: TBody) => string | undefined;
  // 2. 将 Body 转换为具体业务消息 (PluginInStream 等)
  parseMessage: (body: TBody) => TParsed;
  // 3. 业务派发逻辑 (例如 push 到 queue 或 emit 逻辑)
  dispatch: (message: TParsed) => void;
}

export class StreamRequestHandler {
  /**
   * 统一的处理流式 http 请求的核心模版方法
   */
  static handle<TBody = any, Tparsed = any>(
    request: FastifyRequest,
    reply: FastifyReply,
    options: StreamRequestOptions<TBody, Tparsed>,
  ) {
    try {
      const body = request.body as TBody;
      const sessionId = options.extractSessionId(body);

      if (!sessionId) {
        return reply.code(400).send({ error: 'missing sessionId in request payload' });
      }

      // 1. 设置 HTTP Chunked 响应头
      reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
      reply.raw.setHeader('Transfer-Encoding', 'chunked');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      // 2. 创建只读流
      const responseStream = new Readable({
        read() { } // 由 ResponseWriter 来推送数据
      });

      let lastActivityTime = Date.now();

      // 3. 定时检查空闲超时 (Idle timeout)
      const timeoutCheckInterval = setInterval(() => {
        const idleTimeSeconds = (Date.now() - lastActivityTime) / 1000;
        if (idleTimeSeconds > options.maxSingleConnectionLifetime) {
          cleanup();
          void options.responseWriter.close(sessionId); // 超时释放资源并关闭流
        }
      }, 1000); // 每秒检查一次

      const cleanup = () => {
        clearInterval(timeoutCheckInterval);
      };

      // 4. 将流绑定到 ResponseWriter 并监听活动刷新空闲时间
      options.responseWriter.bindResponse(
        sessionId,
        responseStream,
        () => {
          lastActivityTime = Date.now(); // 刷新空闲时间
        }
      );

      // 5. 监听客户端连接
      request.raw.on('close', () => {
        cleanup();
        void options.responseWriter.close(sessionId); // 客户端断开连接时释放资源
      });

      // 6. 解析人物消息并派发
      const message = options.parseMessage(body);
      options.dispatch(message);

      // 7. 返回响应给客户端，保持连接活跃
      return reply.send(responseStream);
    } catch (e: any) {
      return reply.code(500).send({ error: e?.message || 'internal server error' });
    }
  }
}