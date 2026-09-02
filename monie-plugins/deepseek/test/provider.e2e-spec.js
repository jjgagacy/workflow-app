import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { once } from 'node:events';
import readline from 'node:readline';
const apiKey = process.env.DEEPSEEK_API_KEY; // sk-dde9cceb1b2a4d8e86477dca3851dc66
test('validates DeepSeek provider credentials through the plugin protocol', {
    skip: !apiKey && 'DEEPSEEK_API_KEY is not set',
    timeout: 30_000,
}, async () => {
    const child = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'inherit'], // change inherit => pipe to catch child err
        env: process.env,
    });
    const output = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    const stderr = [];
    // child.stderr.on('data', chunk => stderr.push(Buffer.from(chunk)));
    try {
        await waitForEvent(output, 'heartbeat');
        child.stdin.write(`${JSON.stringify({
            sessionId: 'deepseek-provider-e2e',
            event: 'request',
            data: {
                type: 'model',
                action: 'validate_provider_credentials',
                provider: 'monyii',
                credentials: { apiKey: apiKey },
            },
        })}\n`);
        const response = await waitForEvent(output, 'session');
        console.log('response:', response);
        assert.equal(response.session_id, 'deepseek-provider-e2e');
        assert.equal(response.data.type, 'stream');
        assert.deepEqual(response.data.data, {
            result: true,
            credentials: { apiKey: apiKey },
        });
    }
    finally {
        output.close();
        const childExited = once(child, 'exit');
        child.kill();
        await childExited;
        // assert.equal(stderr.length, 0, Buffer.concat(stderr).toString());
    }
});
function waitForEvent(output, event) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`Timed out waiting for ${event} event.`));
        }, 10_000);
        const onLine = (line) => {
            try {
                console.log('line:', line);
                const message = JSON.parse(line);
                // console.log('message:', message);
                if (message.event === event) {
                    cleanup();
                    resolve(message);
                }
            }
            catch {
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
//# sourceMappingURL=provider.e2e-spec.js.map