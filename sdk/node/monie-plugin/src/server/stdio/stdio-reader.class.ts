import { StreamMessage } from "@/core/dtos/stream.dto";
import { RequestReader } from "../../core/reader.class";
import readline from "readline";

export class StdioReader extends RequestReader {
  private rl: readline.Interface;
  private messageQueue: StreamMessage[] = [];
  private errorQueue: Error[] = [];
  private resolveQueue: ((value: IteratorResult<StreamMessage>) => void) | null = null;
  private isClosed = false;
  private max_queue = 1000;

  constructor() {
    super('stdio');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      // Disable terminal control sequence and line buffering
      terminal: false,
      // Infinity: treat CR and LF as separate line endings (preserve original formatting)
      crlfDelay: Infinity,
    });

    this.setupEventListeners();
  }

  // Passive reading: Only reads from readline interface
  // Limitations:
  // 1. Blocking: Must wait for readline even if messages are already available
  // 2. Single-source: Cannot integrate with other event sources
  // 3. No Flow Control: Consumer cannot signal backpressure
  // async *readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown> {
  //   for await (const line of this.rl) {
  //     if (line.trim()) {
  //       try {
  //         yield JSON.parse(line) as StreamMessage;
  //       } catch (error) {
  //         console.error("Failed to parse message:", error);
  //         this.emit('stream.read.error', error);
  //       }
  //     }
  //   }
  // }

  // Active control: Manages multiple message sources (queue + real-time)
  // Advantages:
  // 1. Non-Blocking: Doesn't block on readline where there are queued messages
  // 2. Memory efficient: Only buffers what's necessary (queues can be bounded)
  // 3. Responsive: Can immediately yield queued messages without I/O delay
  async *readStreamAsync(): AsyncGenerator<StreamMessage, void, unknown> {
    while (!this.isClosed || this.messageQueue.length > 0) {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()!;
        yield message;
        continue;
      }

      if (this.errorQueue.length > 0) {
        const error = this.errorQueue.shift()!;
        throw error;
      }
      if (this.isClosed) {
        break;
      }

      const nextMessage = await new Promise<IteratorResult<StreamMessage>>((resolve) => {
        this.resolveQueue = resolve;
      });
      if (nextMessage.done) {
        break;
      }
      yield nextMessage.value;
    }
  }

  private setupEventListeners(): void {
    this.rl.on('line', (line: string) => {
      if (!line.trim()) return;

      if (this.messageQueue.length > this.max_queue) {
        throw new Error("message queue overflow");
      }

      try {
        const message = JSON.parse(line) as StreamMessage;

        if (this.resolveQueue) {
          this.resolveQueue({ value: message, done: false });
          this.resolveQueue = null;
        } else {
          this.messageQueue.push(message);
        }
      } catch (error) {
        this.emit('stream.read.error', error);
        // If there are waiting consumers, propagate the error
        // And the error to the error queue for later handling
        if (error instanceof Error) {
          this.errorQueue.push(error);
        }
      }
    });

    this.rl.on('close', () => {
      this.isClosed = true;

      if (this.resolveQueue) {
        this.resolveQueue({ value: undefined, done: true });
        this.resolveQueue = null;
      }

      this.restartStream();
    });

    this.rl.on('error', (error: Error) => {
      this.emit('stream.read.error', error);
      this.errorQueue.push(error);

      if (this.resolveQueue) {
        this.resolveQueue({ value: undefined, done: true });
        this.resolveQueue = null;
      }
    })
  }

  close(): void {
    if (!this.isClosed) {
      this.rl.close();
      this.isClosed = true;

      // Clear waiting promise
      if (this.resolveQueue) {
        this.resolveQueue({ value: undefined, done: true });
        this.resolveQueue = null;
      }
    }
  }

  // TODO: restarts not implements, do not close readline
  // async stop(): Promise<void> {
  //   super.stop();
  //   this.close();
  // }

  private restartStream(): void {
    if (!this.isClosed) return;

    this.isClosed = false;
    this.errorQueue = [];
    this.resolveQueue = null;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      // Disable terminal control sequence and line buffering
      terminal: false,
      // Infinity: treat CR and LF as separate line endings (preserve original formatting)
      crlfDelay: Infinity,
    });

    this.setupEventListeners();
  }
}
