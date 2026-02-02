import { StreamRequestEvent } from "../entities/event.enum.js";

export class TestMessageFactory {
  static createRequestMessage<T extends Record<string, any> = Record<string, unknown>>(
    overrides: { data?: Partial<TestMessage> } & T = {} as any
  ) {
    const baseMessage: TestMessage = {
      sessionId: `test-session-${Date.now}`,
      event: StreamRequestEvent.REQUEST,
      data: {
        query: "Test query",
        parameters: {},
        ...(overrides.data || {})
      },
      conversationId: `conv-${Math.random().toString(36).substring(2, 9)}`,
      messageId: `msg-${Math.random().toString(36).substring(2, 9)}`,
      appId: 'test-app',
      endpointId: 'test-endpoint',
      context: {
        userId: 'test-user',
        timestamp: new Date(),
        source: 'test',
      },
      ...overrides,
    }

    const { data, ...others } = overrides;
    return {
      ...baseMessage,
      ...others as T,
    }
  }

  static createInvocationResponseMessage<T extends Record<string, any> = Record<string, unknown>>(
    overrides: { data?: Partial<TestMessage> } & T = {} as any
  ) {
    return {
      sessionId: `session-${Date.now()}`,
      event: StreamRequestEvent.INVOCATION_RESPONSE,
      data: {
        response: 'Test response',
        result: {
          status: 'success',
          data: {}
        },
        metadata: {
          processingTime: 100,
          model: 'test-model'
        },
        ...(overrides.data || {})
      },
      conversationId: `conv-${Math.random().toString(36).substr(2, 9)}`,
      messageId: `msg-${Math.random().toString(36).substr(2, 9)}`,
      appId: 'response-app',
      endpointId: 'response-endpoint',
      context: {
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        invokedAt: new Date().toISOString()
      },
      ...overrides
    };
  }
}

// 类型定义
interface TestMessage {
  sessionId: string;
  event: any; // 使用实际的StreamRequestEvent类型
  data: TestMessageData;
  conversationId: string;
  messageId: string;
  appId: string;
  endpointId: string;
  context: MessageContext;
}

interface TestMessageData {
  [key: string]: any;
}

interface MessageContext {
  [key: string]: any;
}

