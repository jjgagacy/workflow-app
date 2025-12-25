import { StreamRequestEvent } from "@/core/entities/event.enum";
import { ToolInvokeRequest } from "@/core/entities/plugin/request/tool.request";
import { TestMessageFactory } from "@/core/test/message-factory";
import { Plugin } from "@/plugin";
import { EventEmitter } from 'events';
import path from "path";
import { PassThrough } from "stream";


describe('TelegraphTests', () => {
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

  it('invoke telegraph tool', async () => {
    const configPath = path.resolve(__dirname, '..');
    const p = new Plugin(configPath);

    p.run();
    await new Promise(resolve => setTimeout(resolve, 100));

    const sessionId = 'session-revoke-tool-test';

    const invokeTool = new ToolInvokeRequest({
      provider: 'telegraph',
      tool: 'telegraph',
      credentials: {
        accessToken: 'test-token',
      },
      toolParameters: {
        title: 'Hello',
        content: 'World',
      }
    });
    mockStdin.emit('data', JSON.stringify({ sessionId, event: 'request', data: invokeTool }) + '\n');

    function waitForStdout(
      matcher: (text: string) => boolean,
      timeout = 2000
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
          const text = getStdoutText();
          // console.log('text:', text);
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

    const output = await waitForStdout(text => {
      try {
        const lines = text.split('\n').filter(Boolean);
        return lines.some(line => {
          if (line.trim().length === 0) return false;
          const msg = JSON.parse(line);
          return (
            msg.sessionId === sessionId &&
            msg.event === 'session' &&
            msg.data?.type === 'stream'
          );
        });
      } catch {
        return false;
      }
    });

    // validate
    const messages = output
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));

    const response = messages.find(
      m => m.sessionId === sessionId && m.event === 'session'
    );

    console.log('response:', response)

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.data.data).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 2000));
  });
});
