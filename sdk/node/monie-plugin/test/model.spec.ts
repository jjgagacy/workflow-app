import { ModelType } from "@/core/entities/enums/model.enum";
import { PluginInvokeType } from "@/core/entities/enums/plugin.type";
import { PromptMessage, PromptMessageRole } from "@/core/entities/plugin/message/message";
import { EndpointActions, ModelActions } from "@/core/entities/plugin/request/request";
import { TestMessageFactory } from "@/core/test/message-factory";
import { Plugin } from "@/plugin";
import { EventEmitter } from 'events';
import path from "path";
import { PassThrough } from "stream";

describe('ModelTests', () => {
  jest.setTimeout(30000);
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
    mockStdin = new EventEmitter();
    mockStdin.setEncoding = jest.fn();
    mockStdin.resume = jest.fn();
    mockStdin.pause = jest.fn();
    mockStdin.isTTY = false;

    mockStdout = new PassThrough();
    stdoutChunks = [];

    mockStdout.on('data', (chunk) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    jest.spyOn(process, 'stdin', 'get').mockReturnValue(mockStdin as any);
    jest.spyOn(process, 'stdout', 'get').mockReturnValue(mockStdout as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockStdin.removeAllListeners();
    mockStdout.removeAllListeners();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // ✅ 确保所有异步操作完成
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should process a conversation flow', async () => {
    const configPath = path.resolve(__dirname, '..');
    const p = new Plugin(configPath);

    p.run();
    await new Promise(resolve => setTimeout(resolve, 100));

    const sessionId = 'session-model-test';

    const requestMsg = TestMessageFactory.createRequestMessage({
      sessionId,
      data: {
        type: PluginInvokeType.Model,
        action: ModelActions.InvokeLLM,
        provider: 'openai',
        model: 'gpt-3.5-turbo-instruct',
        modelType: ModelType.LLM,
        credentials: {
          openai_api_key: '',
          openai_organization: '',
        },
        stream: false,
        promptMessages: [
          new PromptMessage({ role: PromptMessageRole.USER, content: 'hello ai' }),
        ],
        modelParameters: {},
        stop: [],
        tools: [],
      }
    });
    mockStdin.emit('data', JSON.stringify(requestMsg) + '\n');

    function waitForStdout(
      matcher: (text: string) => boolean,
      timeout = 2000
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
          const text = getStdoutText();
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

    console.log('ouput:', output);

    expect(output).toContain(`"sessionId":"${sessionId}"`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    p.stop();
  });
});
