import { MessageType, Tool, ToolInvokeMessage, ToolParameter } from "monie-plugin";

export class TelegraphTool extends Tool {
  invoke(toolParameters: Record<string, any>):
    AsyncGenerator<ToolInvokeMessage> |
    Iterable<ToolInvokeMessage> |
    Promise<ToolInvokeMessage> {
    const { content, title } = toolParameters;
    if (!content) {
      throw new Error("Content parameter is required");
    }
    // Create Telegraph article and return the public URL
    const articleUrl = `https://telegra.ph/${Date.now()}`;
    // jj1:

    if (title === '1') {
      return this.streamInvoke(toolParameters);
    }

    return this.singleInvoke(toolParameters);
  }

  private async singleInvoke(toolParameters: Record<string, any>): Promise<ToolInvokeMessage> {
    return new ToolInvokeMessage({
      type: MessageType.JSON,
      message: { jsonObject: { result: 'success', params: toolParameters } },
      meta: { timestamp: Date.now() },
      id: crypto.randomUUID(),
    });
  }

  private async *streamInvoke(toolParameters: Record<string, any>): AsyncGenerator<ToolInvokeMessage> {
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield new ToolInvokeMessage({
        type: MessageType.TEXT,
        message: { text: `Stream chunk ${i + 1}: ${JSON.stringify(toolParameters)}` },
        meta: { chunk: i }
      });
    }
  }

  async getRuntimeParameters(): Promise<ToolParameter[]> {
    return [];
  }
}
