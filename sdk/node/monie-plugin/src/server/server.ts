export interface ServerInfo {
  [key: string]: any;
}

export interface Server {
  start(): Promise<void>;
  stop(): Promise<void>;
  handleRequest(request: any): Promise<any>;
  getServerInfo(): ServerInfo;
}

export interface Reader {
  type: string;
}

export interface Writer {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}
