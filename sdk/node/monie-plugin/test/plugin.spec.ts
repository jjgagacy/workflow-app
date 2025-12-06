import { StreamRequestEvent } from "@/core/entities/event.enum";
import { TestMessageFactory } from "@/core/test/message-factory";
import { Plugin } from "@/plugin";
import { EventEmitter } from 'events';

describe('PluginTests', () => {
  jest.setTimeout(30000);
  let originStdin: NodeJS.ReadStream;
  let mockStdin: any;

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
  });

  afterEach(() => {
    Object.defineProperty(process, 'stdin', {
      value: originStdin,
      writable: true,
    });
  });

  // it('should start plugin and receive request message', async () => {
  //   const p = new Plugin();
  //   const pluginPromise = p.run();

  //   // 给插件一些时间初始化
  //   await new Promise(resolve => setTimeout(resolve, 100));

  //   const requestMessage = {
  //     sessionId: 'test-session-123',
  //     event: StreamRequestEvent.REQUEST,
  //     data: {
  //       query: 'Hello world',
  //       parameters: {
  //         temperature: 0.7,
  //         maxTokens: 100
  //       }
  //     },
  //     conversationId: 'conv-456',
  //     messageId: 'msg-789',
  //     appId: 'test-app',
  //     endpointId: 'chat-endpoint',
  //     context: {
  //       userId: 'user-001',
  //       timestamp: Date.now()
  //     },
  //     // 注意：reader 和 writer 会在 StreamMessage 构造函数中设置
  //     // 但 JSON.parse 不会包含这些，所以我们需要在测试中单独处理
  //   };

  //   mockStdin.emit('data', JSON.stringify(requestMessage) + '\n');
  //   await new Promise(resolve => setTimeout(resolve, 50));

  //   // 发送结束信号
  //   mockStdin.emit('data', '\n');
  //   mockStdin.emit('end');

  //   await pluginPromise;
  // });

  it('should process a conversation flow', async () => {
    const p = new Plugin();
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
      TestMessageFactory.createInvocationResponseMessage({
        sessionId,
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

    mockStdin.emit('data', '\n');
    mockStdin.emit('end');

    await new Promise(resolve => setTimeout(resolve, 2000));
    mockStdin.emit('data', JSON.stringify(messages[0]) + '\n');

    await pluginPromise;
  });
});
