import { EnvLoader } from "./config/env-loader.js";
import { PluginConfig } from "./config/config.js";
import { StreamFactory } from "./core/factory.class.js";
import { StreamMessage } from "./core/dtos/stream.dto.js";
import { StreamRequestEvent } from "./core/entities/event.enum.js";
import { IOServer } from "./server/io.server.js";
import { TCPReaderWriter } from "./server/tcp/tcp-reader.class.js";
import { MessageType } from "./index.js";

export class Plugin extends IOServer {
  private readonly remoteStream: TCPReaderWriter | undefined;
  private serverStarted = false;

  constructor(configPath?: string) {
    const envLoader = new EnvLoader();
    envLoader.load(configPath);
    const config = new PluginConfig(envLoader);
    const streams = StreamFactory.create(config);
    super(config, streams.reader, streams.writer);
    this.remoteStream = streams.reader instanceof TCPReaderWriter
      ? streams.reader
      : undefined;
    this.setHandler(this.handleMessage.bind(this));
  }

  async startServer(): Promise<void> {
    await this.registry.ready();

    if (this.remoteStream) {
      const remoteStream = this.remoteStream;
      remoteStream.onConnection(async () => {
        await remoteStream.initialize(this.registry);
        if (!this.serverStarted) {
          this.serverStarted = true;
          void this.start();
        }
      });
      remoteStream.launch();
      return;
    }

    return this.start();
  }

  async stopServer(): Promise<void> {
    return this.stop();
  }

  async run(): Promise<void> {
    await this.startServer();
  }

  protected override isCPUTask(message: StreamMessage): boolean {
    return false;
  }

  async handleMessage(msg: StreamMessage): Promise<any> {
    switch (msg.event) {
      case StreamRequestEvent.REQUEST:
        return this.handleRequestMessage(msg);
      case StreamRequestEvent.SHUTDOWN:
        await this.stopServer();
        break;
      case StreamRequestEvent.INVOCATION_RESPONSE:
        return {};
      default:
        return { error: "Unknown event type" };
    }
  }

  protected async handleRequestMessage(msg: StreamMessage): Promise<any> {
    return {
      type: MessageType.TEXT,
      message: {
        error: "no route found or handlers trigger errors"
      },
    };
  }
}
