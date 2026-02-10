import { spawn } from "child_process";
import readline from 'node:readline';

const child = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

child.stdout.on('data', (data) => {
  console.log(`plugin: ${data.toString()}.`);
});

const rawHttpRequest = [
  'GET /duck/123 HTTP/1.1',
  'Host: localhost',
  '\r\n'
].join('\r\n');

const rl = readline.createInterface({
  input: child.stdout,
  crlfDelay: Infinity
});

function waitForReady() {
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      try {
        const msg = JSON.parse(line);
        if (msg.event === 'heartbeat') {
          resolve();
        }
      } catch { }
    });
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

await waitForReady();
// 可能heartbeat先开始了，endpoint路径还没有parse
await sleep(3000);

child.stdin.write(
  JSON.stringify({
    sessionId: null,
    event: 'request',
    data: {
      type: 'endpoint',
      action: 'invoke_endpoint',
      rawHttpRequest,
      settings: {
        foo: 'a123'
      }
    }
  }) + '\n'
);