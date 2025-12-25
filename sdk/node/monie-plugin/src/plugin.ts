import { IOServer } from "./server/io.server";
import { EnvLoader } from "./config/env-loader";
import { PluginConfig } from "./config/config";
import { StreamFactory } from "./core/factory.class";
import { StreamMessage } from "./core/dtos/stream.dto";
import { StreamRequestEvent } from "./core/entities/event.enum";

export class Plugin extends IOServer {
  constructor(configPath?: string) {
    const envLoader = new EnvLoader();
    envLoader.load(configPath);
    const config = new PluginConfig(envLoader);
    const { reader, writer } = StreamFactory.create(config);
    super(config, reader, writer);

    this.setHandler(this.handleMessage.bind(this));
  }

  async startServer(): Promise<void> {
    return this.start();
  }

  async stopServer(): Promise<void> {
    return this.stop();
  }

  async run(): Promise<void> {
    await this.startServer();
  }

  protected override isCPUTask(message: StreamMessage): boolean {
    return true;
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
    return "response...";
  }
}
