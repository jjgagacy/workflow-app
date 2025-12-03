import { PluginConfig } from "@/config/config";
import type { Server, ServerInfo } from "./server";
import { StreamReader, StreamWriter } from "@/core/streams/stream";

export class IOServer implements Server {
  constructor(
    private config: PluginConfig,
    private reader: StreamReader,
    private writer?: StreamWriter
  ) { }

  start(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  handleRequest(request: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getServerInfo(): ServerInfo {
    throw new Error("Method not implemented.");
  }
}
