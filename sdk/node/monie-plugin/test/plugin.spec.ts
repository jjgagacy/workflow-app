import { StreamRequestEvent } from "@/core/entities/event.enum";
import { TestMessageFactory } from "@/core/test/message-factory";
import { Plugin } from "@/plugin";
import { EventEmitter } from 'events';
import path from "path";
import { PassThrough } from "stream";


describe('PluginTests', () => {
  jest.setTimeout(30000);
  let originStdin: NodeJS.ReadStream;
  let originStdout: NodeJS.WriteStream;
  let mockStdin: any;
  let mockStdout: PassThrough;
  let stdoutChunks: Buffer[];

  function getStdoutText() {
    return Buffer.concat(stdoutChunks).toString('utf-8');
  }

  function parseStdoutLines(text: string): any[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  beforeEach(() => {
    originStdin = process.stdin;

    mockStdin = new EventEmitter();
    mockStdin.setEncoding = jest.fn();
    mockStdin.resume = jest.fn();
    mockStdin.pause = jest.fn();
    mockStdin.isTTY = false;

    Object.defineProperty(process, 'stdin', {
      value: mockStdin,
      writable: false,
    });

    originStdout = process.stdout;
    mockStdout = new PassThrough();
    stdoutChunks = [];

    mockStdout.on('data', (chunk) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    Object.defineProperty(process, 'stdout', {
      value: mockStdout,
      writable: false,
    })
  });

  afterEach(() => {
    Object.defineProperty(process, 'stdin', {
      value: originStdin,
      writable: true,
    });
    Object.defineProperty(process, 'stdout', {
      value: originStdout,
      writable: true,
    });
  });

  it('should start plugin and receive request message', async () => {
    const p = new Plugin();
    const pluginPromise = p.run();

    // 给插件一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 100));

    const requestMessage = {
      sessionId: 'test-session-123',
      event: StreamRequestEvent.REQUEST,
      data: {
        query: 'Hello world',
        parameters: {
          temperature: 0.7,
          maxTokens: 100
        }
      },
      conversationId: 'conv-456',
      messageId: 'msg-789',
      appId: 'test-app',
      endpointId: 'chat-endpoint',
      context: {
        userId: 'user-001',
        timestamp: Date.now()
      },
      // 注意：reader 和 writer 会在 StreamMessage 构造函数中设置
      // 但 JSON.parse 不会包含这些，所以我们需要在测试中单独处理
    };

    mockStdin.emit('data', JSON.stringify(requestMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 50));

    // 发送结束信号
    mockStdin.emit('data', '\n');
    mockStdin.emit('end');

    // await pluginPromise;
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  it('should process a conversation flow', async () => {
    const configPath = path.resolve(__dirname, '..');
    const p = new Plugin(configPath);
    const receivedMessages: any[] = [];

    const pluginPromise = p.run();
    await new Promise(resolve => setTimeout(resolve, 100));

    const sessionId = 'session-flow-test';

    const messages = [
      TestMessageFactory.createRequestMessage({
        sessionId,
        data: {
          query: "What is the weather today?",
          pamaters: { location: "New York" },
        }
      }),
      TestMessageFactory.createRequestMessage({
        sessionId: "session-2",
        data: {
          query: "What is the weather today?",
          pamaters: { location: "New York" },
        }
      }),
      TestMessageFactory.createInvocationResponseMessage({
        sessionId: "session-3",
        data: {
          response: 'The weather in New York is sunny, 25°C.',
          result: {
            status: 'success',
            data: {
              temperature: 25,
              condition: 'sunny',
              humidity: 60
            }
          }
        }
      }),
    ];

    for (const message of messages) {
      mockStdin.emit('data', JSON.stringify(message) + '\n');
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // mockStdin.emit('data', '\n');
    // mockStdin.emit('end');

    // await new Promise(resolve => setTimeout(resolve, 2000));
    const last = TestMessageFactory.createRequestMessage({
      sessionId: "session-last",
      data: {
        query: "What is the weather today?",
        pamaters: { location: "New York" },
      }
    })
    mockStdin.emit('data', JSON.stringify(last) + '\n');
    mockStdin.emit('data', '\n');

    mockStdin.emit('data', JSON.stringify({ sessionId: 'end', event: '__shutdown__', data: {} }) + '\n');

    function waitForStdout(
      matcher: (text: string) => boolean,
      timeout = 2000
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
          const text = getStdoutText();
          console.log('text:', text);
          if (matcher(text)) {
            clearInterval(interval);
            resolve(text);
          }
          if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject(new Error('stdout wait timeout'));
          }
        }, 20);
      });
    }

    const output = await waitForStdout(
      text => text.includes('"event":"session"')
    );

    expect(output).toContain('"sessionId":"session-flow-test"');
    expect(output).toContain('"sessionId":"session-2"');
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
});
