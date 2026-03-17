export class PluginDaemonBasicResponse<T> {
  constructor(
    public code: number,
    public message: string,
    public data: T | null
  ) { }

  isSuccess(): boolean {
    return this.code === 0;
  }

  hasData(): boolean {
    return this.data !== null && this.data !== undefined;
  }

  getDataOrThrow(): T {
    if (!this.hasData()) {
      throw new Error('Response data is null');
    }
    return this.data as T;
  }

  toJSON(): object {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }

  static fromJSON<T>(json: any): PluginDaemonBasicResponse<T> {
    return new PluginDaemonBasicResponse<T>(
      json.code,
      json.message,
      json.data
    );
  }

  static success<T>(data: T): PluginDaemonBasicResponse<T> {
    return new PluginDaemonBasicResponse(0, 'success', data);
  }

  static error(code: number, message: string): PluginDaemonBasicResponse<null> {
    return new PluginDaemonBasicResponse(code, message, null);
  }
}