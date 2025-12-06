import { StreamMessage } from "@/core/dtos/stream.dto";
import { RequestReader } from "../../core/reader.class";
import readline from "readline";

export class StdioReader extends RequestReader {
  private rl: readline.Interface;
  private messageQueue: StreamMessage[] = [];
  private errorQueue: Error[] = [];
  private resolveQueue: ((value: IteratorResult<StreamMessage>) => void) | null = null;
  private isClosed = false;

  constructor() {
    super('stdio');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
      crlfDelay: Infinity,
    });

    this.setupEventListeners();
  }

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

  close(): void {
    if (!this.isClosed) {
      this.rl.close();
      this.isClosed = true;

      // 清理等待的 promise
      if (this.resolveQueue) {
        this.resolveQueue({ value: undefined, done: true });
        this.resolveQueue = null;
      }
    }
  }

  private setupEventListeners(): void {
    this.rl.on('line', (line: string) => {
      if (!line.trim()) return;

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
        // 如果有等待的消费者，传递错误
        // 将错误加入错误队列
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
}
