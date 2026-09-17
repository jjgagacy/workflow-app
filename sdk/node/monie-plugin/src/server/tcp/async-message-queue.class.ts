type PendingResolver<T> = (result: IteratorResult<T>) => void;

export class AsyncMessageQueue<T> {
  private queue: T[] = [];
  private resolvers: Array<PendingResolver<T>> = [];
  private closed = false;

  push(value: T): void {
    if (this.closed) {
      return;
    }

    const resolve = this.resolvers.shift();
    if (resolve) {
      resolve({
        done: false,
        value,
      });
      return;
    }
    this.queue.push(value);
  }

  close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    while (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;

      resolve({
        done: true,
        value: undefined as never,
      });
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    while (true) {
      if (this.queue.length > 0) {
        yield this.queue.shift()!;
        continue;
      }

      if (this.closed) {
        return;
      }

      const result = await new Promise<IteratorResult<T>>(
        resolve => {
          this.resolvers.push(resolve);
        },
      );

      if (result.done) {
        return;
      }

      yield result.value;
    }
  }
}