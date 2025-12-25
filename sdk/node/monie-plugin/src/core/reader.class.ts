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

  constructor(
    type: string,
    private pollInterval: number = 10
  ) {
    super();
    this.type = type;
  }

  abstract readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown>;

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
          this.read(line);
          // Add a small delay to avoid processing too quickly
          if (this.pollInterval > 0) {
            await this.sleep(this.pollInterval);
          }
        }
      } catch (error) {
        console.error("Error in event loop", error);
        // Wait longer after en error
        this.emit('event.loop.error', error);
        await this.sleep(1000);
      }
    }
    this.emit('reader.stopped');
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
    this.emit('event.loop.stopped');
  }

  private async processMessagesNonBlocking(): Promise<void> {
    const iterator = this.readStreamAsync()[Symbol.asyncIterator]();
    let consecutiveEmpty = 0;
    // Limit empty iterations to avoid busy waiting (prevent idle/empty loops)
    const maxEmptyIterations = 10;

    while (this.isRunning && consecutiveEmpty < maxEmptyIterations) {
      try {
        // Use Promise.race to avoid long-term blocking
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
        // reset empty loop counter
        consecutiveEmpty = 0;
        // handle messages
        this.handleMessageAsync(message);
        // add poll interval
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
    // Use microtasks or setImmediate to avoid blocking
    await new Promise<void>(resolve => {
      setImmediate(async () => {
        try {
          this.read(data);
        } catch (error) {
          console.error('Error processing message:', error);
          this.emit('message.process.error', { message: data, error });
        } finally {
          resolve();
        }
      });
    });
  }

  // Process messages asynchronously (without blocking the event loop)
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
            this.emit('reader.callback.error', { message, callback, error });
          }
        }),
      );
    }

    await this.read(message);
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

  // External IO Server can listen 'message.received' event 
  // Or register a callback vir onMessage to handle it
  async read(data: StreamMessage): Promise<any> {
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }
}
