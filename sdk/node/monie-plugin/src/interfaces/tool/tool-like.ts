import { InvokeMessage } from "@/core/dtos/invoke-message.dto.js";
import { LogMessage } from "@/core/dtos/log-message.dto.js";
import { BlobMessage, InvokeMessagePayload, JsonMessage, MessageType, TextMessage, VariableMessage } from "@/core/dtos/message.dto.js";

export abstract class ToolLike<T extends InvokeMessage> {
  responseType!: new (...args: any[]) => T;

  constructor() { }

  protected createMessage(payload: InvokeMessagePayload): T {
    return new this.responseType(payload);
  }

  createTextMessage(text: string): T {
    return this.createMessage({
      type: MessageType.TEXT,
      message: { text } as TextMessage,
    });
  }

  createJsonMessage(json: Record<string, any> | any[]): T {
    return this.createMessage({
      type: MessageType.JSON,
      message: { jsonObject: json } as JsonMessage,
    });
  }

  createImageMessage(imageUrl: string): T {
    return this.createMessage({
      type: MessageType.IMAGE,
      message: { text: imageUrl } as TextMessage,
    });
  }

  createLinkMessage(link: string): T {
    return this.createMessage({
      type: MessageType.LINK,
      message: { text: link } as TextMessage,
    });
  }

  createBlobMessage(blob: Uint8Array, meta?: any): T {
    return this.createMessage({
      type: MessageType.BLOB,
      message: { blob } as BlobMessage,
      meta,
    });
  }

  createVariableMessage(variableName: string, variableValue: any, stream: boolean = false): T {
    return this.createMessage({
      type: MessageType.VARIABLE,
      message: { variableName, variableValue, stream } as VariableMessage,
    });
  }

  createLogMessage(data: Partial<LogMessage>): T {
    return this.createMessage({
      type: MessageType.LOG,
      message: {
        id: data.id || '',
        label: data.label,
        data: data.data,
        status: data.status,
        parentId: data.parentId,
        metadata: data.metadata,
      } as LogMessage,
    });
  }
}
