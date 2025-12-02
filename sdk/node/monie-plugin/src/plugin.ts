import { IOServer } from "./classes/io-server.class";
import { Router } from "./classes/router.class";

export class Plugin {
  private ioServer: IOServer;
  private router: Router

  constructor() {
    this.ioServer = new IOServer();
    this.router = new Router();
  }

  async startServer(): Promise<void> {

  }

  async stopServer(): Promise<void> {

  }

  async start() {
    console.log('Starting plugin...');
    await this.startServer();

    console.log('Plugin started successfully');
  }

  async run(): Promise<void> {
    this.start();
  }
}
