import { describe, it, expect } from '@jest/globals';
import { PluginConfig } from "../src/config/config.js";
import { EnvLoader } from "../src/config/env-loader.js";
import { StreamMessage } from "../src/core/dtos/stream.dto.js";
import { StreamRequestEvent } from "../src/core/entities/event.enum.js";
import { RequestReader } from "../src/core/reader.class.js";
import { ResponseWriter } from "../src/core/writer.class.js";
import { IOServer } from "../src/server/io.server.js";

class TestRequestReader extends RequestReader {
  private queue: StreamMessage[] = [];

  constructor() {
    super('test');
  }

  push(message: StreamMessage) {
    this.queue.push(message);
  }

  async *readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown> {
    while (this.queue.length > 0) {
      yield this.queue.shift()!;
      await new Promise(r => setImmediate(r)); // Yield the event loop
    }
  }
}

// A FakeWriter that is observable
class TestResponseWriter extends ResponseWriter {
  responses: Array<{ sessionId: string; result: any; time: number }> = [];
  async write(data: string): Promise<void> {
    if (data.trim().length === 0) return; // filter \n
    const parsed = JSON.parse(data);
    if (parsed.event === 'heartbeat') return; // filter heartbeat
    this.responses.push({
      sessionId: parsed.sessionId,
      result: parsed.result,
      time: Date.now(),
    })
  }
  async close(): Promise<void> {
  }
}

it('should not block other messages when one message is slow', async () => {
  const reader = new TestRequestReader();
  const writer = new TestResponseWriter();

  const envLoader = new EnvLoader();
  envLoader.load('.');
  const config = new PluginConfig(envLoader);
  const server = new IOServer(config, reader, writer);

  server['messageHandler'] = async (msg: StreamMessage) => {
    if (msg.data.sleep) {
      await new Promise(r => setTimeout(r, 300));
    }
    return { ok: true, id: msg.sessionId };
  }

  const start = Date.now();

  const messages: StreamMessage[] = [
    {
      sessionId: 'fast-1',
      event: StreamRequestEvent.REQUEST,
      data: {},
    } as any,
    {
      sessionId: 'slow',
      event: StreamRequestEvent.REQUEST,
      data: { sleep: true },
    } as any,
    {
      sessionId: 'fast-2',
      event: StreamRequestEvent.REQUEST,
      data: {},
    } as any,
  ];

  // concurrent push
  messages.forEach(m => reader.push(m));
  // start server
  server.start();
  // response 
  await new Promise(resolve => setTimeout(resolve, 2000));
  expect(writer.responses.length).toBe(3);

  const slow = writer.responses.find(r => r.sessionId === 'slow')!;
  const fast1 = writer.responses.find(r => r.sessionId === 'fast-1')!;
  const fast2 = writer.responses.find(r => r.sessionId === 'fast-2')!;

  expect(fast1.time).toBeLessThan(slow.time);
  expect(fast2.time).toBeLessThan(slow.time);

  // 快请求不应该被 delay 太多
  expect(fast1.time - start).toBeLessThan(100);
  expect(fast2.time - start).toBeLessThan(100);
});


