import { Endpoint, Request, Response, ToolInvokeMessage } from "monie-plugin";

export class Duck extends Endpoint {
  async invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    const duckSounds = ["quack", "quack-quack", "quaaaack"];
    const randomSound = duckSounds[Math.floor(Math.random() * duckSounds.length)];

    return ToolInvokeMessage.createJson({
      statusCode: 200,
      body: {
        message: `Duck says: ${randomSound}`,
        timestamp: new Date().toISOString()
      }
    });
  }
}

