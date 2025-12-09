import { IOServer } from "./server/io-server.class";
import { Router } from "./core/classes/router.class";
import { EnvLoader } from "./config/env-loader";
import { PluginConfig } from "./config/config";
import { StreamFactory } from "./core/factory.class";
import { StreamMessage } from "./core/dtos/stream.dto";

export class Plugin extends IOServer {
  private router: Router

  constructor(configPath?: string) {
    const envLoader = new EnvLoader();
    envLoader.load(configPath);
    const config = new PluginConfig(envLoader);
    const { reader, writer } = StreamFactory.create(config);
    super(config, reader, writer);

    this.router = new Router(reader, writer);
    this.registerRoutes();
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

  private registerRoutes(): void {
    // Register your routes here
  }

  protected override isCpuTask(message: StreamMessage): boolean {
    return true;
  }
}
