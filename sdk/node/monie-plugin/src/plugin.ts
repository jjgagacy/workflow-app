import { IOServer } from "./server/io-server.class";
import { Router } from "./core/classes/router.class";
import { EnvLoader } from "./config/env-loader";
import { PluginConfig } from "./config/config";
import { StreamFactory } from "./core/factory.class";

export class Plugin {
  private config: PluginConfig;
  private ioServer: IOServer;
  private router: Router

  constructor(configPath?: string) {
    const envLoader = new EnvLoader();
    envLoader.load(configPath);
    this.config = new PluginConfig(envLoader);

    const { reader, writer } = StreamFactory.create(this.config);
    this.ioServer = new IOServer(this.config, reader, writer);
    this.router = new Router(reader, writer);

    this.registerRoutes();
  }

  async startServer(): Promise<void> {
    return this.ioServer.start();
  }

  async stopServer(): Promise<void> {
    return this.ioServer.stop();
  }

  async start() {
    await this.startServer();
  }

  async run(): Promise<void> {
    await this.start();
  }

  private registerRoutes(): void {
    // Register your routes here
  }
}
