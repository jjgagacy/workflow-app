import readline from 'readline';

class StartPluginTest {
    constructor() {
        this.heartbeatCount = 0;
        this.running = true;
        this.setupSignalHandlers();
        this.setupInput();
    }

    setupSignalHandlers() {
        process.on('SIGTERM', () => {
            this.sendLog('Received SIGTERM, shutting down...')
            this.running = false
            process.exit(0)
        })

        process.on('SIGINT', () => {
            this.sendLog('Received SIGINT, shutting down...')
            this.running = false
            process.exit(0)
        })
    }

    setupInput() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        })

        rl.on('line', (line) => {
            this.handleInput(line)
        })

        rl.on('close', () => {
            this.sendLog('Input stream closed')
            this.running = false
        })
    }

    sendLog(message, level = 'info') {
        this.sendEvent('log', '', {
            message: message,
            level: level,
            timestamp: Date.now(),
        })
    }

    sendHeartbeat() {
        this.heartbeatCount++
        this.sendEvent('heartbeat', '', {
            count: this.heartbeatCount,
            timestamp: Date.now(),
            pid: process.id,
        })
    }

    sendEvent(eventType, sessionId = '', data = null) {
        const event = {
            session_id: sessionId,
            event: eventType,
            data: data,
        }
        console.log(JSON.stringify(event))
    }

    sendSessionMessage(sessionId, messageType, data) {
        const message = {
            type: messageType,
            data: data,
        }
        this.sendEvent('session', sessionId, message)
    }

    handleInput(line) {
        try {
            const data = JSON.parse(line);
            this.sendLog(`Received input: ${JSON.stringify(data)}`)

            if (data.event == 'session') {
                const sessionId = data.session_id || '';
                const messageData = data.data || {};
                this.handleSessionMessage(sessionId, messageData);
            }
        } catch (error) {
            this.sendLog(`Error processing input: ${error.message}`, 'error')
        }
    }

    handleSessionMessage(sessionId, messageData) {
        const messageType = messageData.type;
        const data = messageData.data || {};

        if (messageType == 'invoke') {
            const command = data.command;

            switch (command) {
                case 'ping':
                    this.sendSessionMessage(sessionId, 'stream', { response: 'pong from node' });
                    this.sendSessionMessage(sessionId, 'end', { status: 'success' })
                    break;
                case 'info':
                    this.sendSessionMessage(sessionId, 'stream', {
                        nodeVersion: process.version,
                        platform: process.platform,
                        pid: process.pid,
                        memory: process.memoryUsage()
                    })
                    this.sendSessionMessage(sessionId, 'end', { status: 'info_sent' })
                    break;
                case 'shutdown':
                    this.sendLog('Received shutdown command from session: ' + sessionId);
                    this.running = false;
                    break;
                default:
                    this.sendSessionMessage(sessionId, 'error', {
                        error: `Unknown command: ${command}`,
                        avaiableCommands: ['ping', 'info', 'shutdown']
                    });
            }
        }
    }

    start() {
        this.sendLog('Node.js test plugin started')
        this.sendLog(`Process PID: ${process.pid}`)

        // 发送就绪消息
        this.sendSessionMessage('system', 'stream', {
            status: 'ready',
            startupTime: Date.now(),
            language: 'nodejs',
        })

        // 启动心跳
        const heartbeatInterval = setInterval(() => {
            if (this.running) {
                this.sendHeartbeat()
            } else {
                clearInterval(heartbeatInterval)
            }
        }, 2000);

        // 主循环
        const mainloop = setInterval(() => {
            if (!this.running) {
                clearInterval(mainloop)
                this.sendLog(`Node.js plugin stopping after ${this.heartbeatCount} heartbeats`)
                process.exit(0);
            }
        }, 1000);

        this.sendLog('Node.js StartPlugin test running...');
    }
}

// 启动插件
const plugin = new StartPluginTest()
plugin.start()