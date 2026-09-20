import { Readable } from 'stream';
import { ResponseWriter } from "../../core/writer.class.js";

export class ServerlessResponseWriter extends ResponseWriter {
  // 绑定 sessionId 对应的响应流和活动回调
  private readonly responseStreams = new Map<string, Readable>();
  private readonly onActivityCallbacks = new Map<string, () => void>();

  bindResponse(sessionId: string, responseStream?: Readable | null, onActivity?: () => void): void {
    if (!responseStream) {
      return;
    }
    this.responseStreams.set(sessionId, responseStream);
    if (onActivity) {
      this.onActivityCallbacks.set(sessionId, onActivity);
    }
  }

  /**
   * 写入指定 sessionId 的响应流
   * @param data 
   * @returns 
   */
  async write(data: any, sessionId?: string | null): Promise<void> {
    if (!sessionId)
      return;
    const stream = this.responseStreams.get(sessionId);
    if (!stream || stream.destroyed) {
      return;
    }
    // 触发活跃回调 （更新心跳/刷新时间）
    const onActivity = this.onActivityCallbacks.get(sessionId);
    if (onActivity) {
      onActivity();
    }

    stream.push(String(data));
  }

  async close(sessionId?: string | null): Promise<void> {
    if (!sessionId)
      return;

    const stream = this.responseStreams.get(sessionId);
    if (stream && !stream.destroyed) {
      stream.push(null); // 结束当前响应流
    }

    this.responseStreams.delete(sessionId);
    this.onActivityCallbacks.delete(sessionId);
  }
}