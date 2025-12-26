import { parseRawHttpRequest } from "@/core/entities/endpoint/endpoint.entity";
import { PluginInvokeType } from "@/core/entities/enums/plugin.type";
import { StreamRequestEvent } from "@/core/entities/event.enum";
import { EndpointActions } from "@/core/entities/plugin/request/request";
import { TestMessageFactory } from "@/core/test/message-factory";
import { Plugin } from "@/plugin";
import { EventEmitter } from 'events';
import path from "path";
import { PassThrough } from "stream";


describe('EndpointTests', () => {
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

  it('should process a conversation flow', async () => {
    const configPath = path.resolve(__dirname, '..');
    const p = new Plugin(configPath);

    p.run();
    await new Promise(resolve => setTimeout(resolve, 100));

    const sessionId = 'session-endpoint-test';

    // await new Promise(resolve => setTimeout(resolve, 2000));
    const rawHttpRequest = [
      'GET /duck/123 HTTP/1.1',
      'Host: localhost',
      '\r\n'
    ].join('\r\n');
    const requestMsg = TestMessageFactory.createRequestMessage({
      sessionId,
      data: {
        type: PluginInvokeType.Endpoint,
        action: EndpointActions.InvokeEndpoint,
        rawHttpRequest,
        settings: {},
      }
    })
    mockStdin.emit('data', JSON.stringify(requestMsg) + '\n');

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

    const output = await waitForStdout(
      text => text.includes('"event":"session"')
    );

    console.log('ouput:', output);

    expect(output).toContain(`"sessionId":"${sessionId}"`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
});
