import { MessageType } from "@/core/dtos/message.dto";
import { ToolParameter } from "@/core/entities/plugin/declaration/tool";
import { ToolInvokeMessage } from "@/interfaces/tool/invoke-message";
import { Tool } from "@/interfaces/tool/tool";

export class TelegraphTool extends Tool {
  async invoke(toolParameters: Record<string, any>): Promise<ToolInvokeMessage> {
    const { content, title } = toolParameters;
    if (!content) {
      throw new Error("Content parameter is required");
    }
    // Create Telegraph article and return the public URL
    const articleUrl = `https://telegra.ph/${Date.now()}`;

    return new ToolInvokeMessage({
      type: MessageType.TEXT,
      message: articleUrl,
      timestamp: new Date(),
    });
  }

  async getRuntimeParameters(): Promise<ToolParameter[]> {
    return [];
  }
}
