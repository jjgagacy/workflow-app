export class Duck extends Endpoint {
  async invoke(r: Request, values: Record<string, any>, settings: Record<string, any>): Promise<Response> {
    return ToolInvokeMessage.createText(`id: ${values.appId}`);
  }
}
