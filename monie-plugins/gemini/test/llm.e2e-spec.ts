import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { once } from 'node:events';
import readline from 'node:readline';

test('invokes DeepSeek LLM through the plugin protocol', {
  timeout: 30_000,
}, async () => {
  const child = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: process.env,
  });
  const output = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });

  try {
    await waitForEvent(output, 'heartbeat');
    child.stdin.write(`${JSON.stringify({
      sessionId: 'deepseek-llm-e2e',
      event: 'request',
      data: {
        type: 'model',
        action: 'invoke_llm',
        provider: 'monyii',
        model: 'deepseek-chat',
        modelType: 'llm',
        credentials: { apiKey: 'mock-api-key' },
        promptMessages: [
          { role: 'user', content: 'Reply with exactly: hello' },
        ],
        modelParameters: {
          temperature: 0,
          max_tokens: 16,
        },
        tools: [],
        stop: [],
        stream: false,
        userId: 'deepseek-llm-e2e-user',
      },
    })}\n`);

    const response = await waitForEvent(output, 'session');
    console.log('response:', response);
    assert.equal(response.session_id, 'deepseek-llm-e2e');
    assert.equal(response.data.type, 'stream');
    assert.equal(response.data.data.model, 'deepseek-chat');
    assert.equal(response.data.data.message.role, 'assistant');
    assert.equal(response.data.data.message.content, 'hello');
  } finally {
    output.close();
    const childExited = once(child, 'exit');
    child.kill();
    await childExited;
  }
});

function waitForEvent(output: readline.Interface, event: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${event} event.`));
    }, 10_000);

    const onLine = (line: string) => {
      try {
        console.log('line:', line);
        const message = JSON.parse(line);
        if (message.event === event) {
          cleanup();
          resolve(message);
        }
      } catch {
        // Ignore incomplete or non-protocol output.
      }
    };

    const cleanup = () => {
      clearTimeout(timeout);
      output.off('line', onLine);
    };
    output.on('line', onLine);
  });
}