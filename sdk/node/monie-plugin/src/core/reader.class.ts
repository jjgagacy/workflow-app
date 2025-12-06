import { callbackify } from "util";
import { StreamMessage } from "./dtos/stream.dto";
import { StreamReader } from "./streams/stream";
import { EventEmitter } from 'events';

export type MessageCallback = (message: StreamMessage) => Promise<void> | void;

export abstract class RequestReader extends EventEmitter implements StreamReader {
  type: string;
  private isRunning: boolean = false;
  private processingPromise: Promise<void> | null = null;
  protected useNonBlocking: boolean = true;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private isProcessingQueue: boolean = false;

  constructor(
    type: string,
    private pollInterval: number = 10
  ) {
    super();
    this.type = type;
  }

  abstract readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown>;

  read(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async startEventLoop(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    // 启动消息队列处理器
    if (this.useNonBlocking) {
      this.processingPromise = this.runEventLoopNonBlocking();
    } else {
      this.processingPromise = this.runEventLoop();
    }
    return this.processingPromise;
  }

  // runEventLoop is synchronize and will blocking heartbeat...
  async runEventLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        /**
         * ⚠️ BLOCKING EVENT LOOP WARNING 
         * 
         * This `for wait...of` loop on `readStreamAsync` creates a blocking loop.
         * The issue:
         * 1. `for await...of` async generators creates a synchronous-looking loop
         *    that actually blocks at the microtask level
         * 2.  It continuously awaits the next value from the async iterator without
         *    yielding control back to the Node.js event loop
         * 3. This prevents other asynchronous (like setInterval callbacks, ppromises, i/o callbacks)
         *   from executing until the current iteration complets.
         * 
         * Specifically for readline interface:
         * - While waiting for the next line input, the event loop is stuck at the polling phase
         * - No timer callbacks (heartbeat, intervals) can execute
         * - The entire Node.js process appears "frozen" for other async tasks
         * 
         * Impact on multi-user scenarios:
         * - One user's long-running operation blocks all other users
         * - Heartbeat mechanisms stop working
         * - Timeouts and intervals are delayed
         * - System becomes unresponsive to other inputs
         * 
         * RECOMMENDATION
         * - Use the non-blocking version `runEventLoopNonBlocking()` instead
         * - If you must use this blocking version, ensure:
         *   1. Each iteration is short-lived (process quickly)
         *   2. Add explicit `await this.sleep(0)` to yield control
         *   3. Keep `pollInterval` very small
         *   4. Monitor event loop latency
         * 
         * ALTERNATIVE APPROACHES
         * 1. Use event listeners instead of async iteration
         * 2. Implement a pull-based model with explicit flow control
         * 3. Use worker threads for CPU-intensive processing
         * 4. Implement request throttling and queue management
         */
        for await (const line of this.readStreamAsync()) {
          if (!this.isRunning) break;
          this.processLine(line);
          // 添加小延迟，避免处理太快
          if (this.pollInterval > 0) {
            await this.sleep(this.pollInterval);
          }
        }
      } catch (error) {
        console.error("Error in event loop", error);
        // 错误后等待更长时间
        this.emit('event.loop.error', error);
        await this.sleep(1000);
      }
    }
    this.emit('stopped');
  }

  async runEventLoopNonBlocking(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processMessagesNonBlocking();
      } catch (error) {
        console.error("Error in non-blocking event loop", error);
        this.emit('event.loop.error', error);
        await this.sleep(1000);
      }
    }
    this.emit('stopped');
  }

  private async processMessagesNonBlocking(): Promise<void> {
    const iterator = this.readStreamAsync()[Symbol.asyncIterator]();
    let consecutiveEmpty = 0;
    const maxEmptyIterations = 10; // 防止空转

    // console.log('start processing message');
    while (this.isRunning && consecutiveEmpty < maxEmptyIterations) {
      // console.log('running process message', consecutiveEmpty);
      try {
        // 使用 Promise.race 避免长时间阻塞
        const result = await Promise.race([
          iterator.next(),
          // 添加一个检查 running 状态的 Promise
          new Promise<IteratorResult<StreamMessage>>(resolve => {
            if (!this.isRunning) {
              resolve({ done: true, value: undefined });
            }
          })
        ]);

        if (result.done) {
          // console.log('Stream ended, will retry...');
          await this.sleep(1000); // 等待后重试
          consecutiveEmpty++;
          continue;
        }

        const message = result.value;
        consecutiveEmpty = 0; // 重置空转计数

        // 处理消息
        // await this.processLineAsync(message);
        // await this.processMessageWithSession(message);
        this.handleMessageAsync(message).catch(error => {
          console.error('Async message handling error:', error);
        });

        // 添加处理间隔
        if (this.pollInterval > 0) {
          await this.sleep(this.pollInterval);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
          consecutiveEmpty++;
          console.log('Read timeout, continueing...');
          continue;
        }
        throw error;
      }
    }

    if (consecutiveEmpty >= maxEmptyIterations) {
      console.warn('Too many empty iterations, restarting event loop');
    }
  }

  private async processLineAsync(data: StreamMessage): Promise<void> {
    // 使用微任务或 setImmediate 避免阻塞
    await new Promise<void>(resolve => {
      // 使用 setImmediate 确保不阻塞事件循环
      setImmediate(async () => {
        try {
          this.processLine(data);
        } catch (error) {
          console.error('Error processing message:', error);
          this.emit('message.process.error', { message: data, error });
        } finally {
          resolve();
        }
      });
    });
  }

  private async processMessageWithSession(dta: StreamMessage): Promise<void> {

  }

  // 异步处理消息（不阻塞事件循环）
  private async handleMessageAsync(data: StreamMessage): Promise<void> {
    return new Promise<void>((resolve) => {
      queueMicrotask(async () => {
        try {
          this.triggerMessageProcessing(data);
        } catch (error) {
          console.error('Error in async message handling:', error);
          this.emit('message.process.error', { message: data, error });
        } finally {
          resolve();
        }
      });
    });
  }

  protected async triggerMessageProcessing(message: StreamMessage): Promise<void> {
    this.emit('message.received', message);

    if (this.messageCallbacks.size > 0) {
      const callbacks = Array.from(this.messageCallbacks);
      await Promise.all(
        callbacks.map(async (callback) => {
          try {
            await callback(message);
          } catch (error) {
            console.error('Message callback error:', error);
            this.emit('callback.error', { message, callback, error });
          }
        }),
      );
    }

    await this.processLine(message);
  }

  public onMessage(callback: MessageCallback): void {
    this.messageCallbacks.add(callback);
  }

  public offMessage(callback: MessageCallback): void {
    this.messageCallbacks.delete(callback);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async processLine(data: StreamMessage): Promise<void> {
    console.log('process line: ', data);
    // 外部 IO Server 可以监听 'message.received' 事件
    // 或者通过 onMessage 注册回调来处理
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

}