import { InvokeMessage, InvokeMessageMeta, TextInvokeMessage, JsonInvokeMessage, BlobInvokeMessage, VariableInvokeMessage, RetrieverResourceInvokeMessage } from "@/core/dtos/invoke-message.dto.js";
import { LogMessage, LogStatus } from "@/core/dtos/log-message.dto.js";
import { MessageType, InvokeMessagePayload, TextMessage, JsonMessage, BlobMessage, VariableMessage, RetrieverResource, RetrieverResourceMessage } from "@/core/dtos/message.dto.js";


export class ToolInvokeMessage implements InvokeMessage {
  type: MessageType;
  message: any;
  id?: string | undefined;
  timestamp: Date;
  meta?: InvokeMessageMeta | undefined;

  constructor(data: InvokeMessagePayload | Record<string, any>) {
    this.type = data.type;
    this.message = data.message;

    this.id = (data as any).id ?? crypto.randomUUID();
    this.timestamp = (data as any).timestamp ?? new Date();

    if (this.type === MessageType.BLOB
      || this.type === MessageType.LOG) {
      this.meta = (data as any).meta ?? undefined;
    }
  }

  isTextMessage(): this is ToolInvokeMessage & { type: MessageType.TEXT; message: TextMessage; } {
    return this.type === MessageType.TEXT;
  }

  isJsonMessage(): this is ToolInvokeMessage & { type: MessageType.JSON; message: JsonMessage; } {
    return this.type === MessageType.JSON;
  }

  isBlobMessage(): this is ToolInvokeMessage & { type: MessageType.BLOB; message: BlobMessage; meta?: InvokeMessageMeta; } {
    return this.type === MessageType.BLOB;
  }

  isLogMessage(): this is ToolInvokeMessage & { type: MessageType.LOG; message: LogMessage; meta?: InvokeMessageMeta; } {
    return this.type === MessageType.LOG;
  }

  getTextContent(): string | null {
    if (this.isTextMessage() ||
      this.type === MessageType.IMAGE ||
      this.type === MessageType.LINK ||
      this.type === MessageType.IMAGE_LINK) {
      return this.message.text;
    }
    return null;
  }

  getJsonContent(): any | null {
    if (this.isJsonMessage()) {
      return this.message.json_object;
    }
    return null;
  }

  getBlobContent(): Uint8Array | null {
    if (this.isBlobMessage()) {
      return this.message.blob;
    }
    return null;
  }

  static createText(text: string, options?: { id?: string; meta?: any; }): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.TEXT,
      message: { text } as TextMessage,
      id: options?.id ?? crypto.randomUUID(),
      timestamp: new Date(),
      meta: options?.meta,
    });
  }

  static createJson(json: any, options?: { id?: string; meta?: any; }): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.JSON,
      message: { jsonObject: json } as JsonMessage,
      id: options?.id ?? crypto.randomUUID(),
      timestamp: new Date(),
      meta: options?.meta,
    });
  }

  static createBlob(blob: Uint8Array, options?: { id?: string; meta?: any; }): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.BLOB,
      message: { blob } as BlobMessage,
      id: options?.id ?? crypto.randomUUID(),
      timestamp: new Date(),
      meta: options?.meta,
    });
  }

  static createLog(
    label: string,
    data: Record<string, any>,
    status: LogStatus = LogStatus.SUCCESS,
    options?: { id?: string; parentId?: string; meta?: any; }
  ): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.LOG,
      message: {
        id: options?.id ?? crypto.randomUUID(),
        label,
        data,
        status,
        parent_id: options?.parentId,
        metadata: options?.meta,
      } as LogMessage,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      meta: options?.meta,
    });
  }

  static createVariable(variableName: string, variableValue: any, options?: { stream: boolean; }): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.VARIABLE,
      message: {
        variableName,
        variableValue,
        stream: options?.stream
      } as VariableMessage,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    });
  }

  static createRetrieverResource(retrieverResources: RetrieverResource[], context: string): ToolInvokeMessage {
    return new ToolInvokeMessage({
      type: MessageType.RETRIEVER_RESOURCES,
      message: {
        retrieverResources,
        context
      } as RetrieverResourceMessage,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    });
  }

  asTextMessage(): TextInvokeMessage | null {
    if (this.type === MessageType.TEXT) {
      return this as unknown as TextInvokeMessage;
    }
    return null;
  }

  asJsonMessage(): JsonInvokeMessage | null {
    if (this.type === MessageType.JSON) {
      return this as unknown as JsonInvokeMessage;
    }
    return null;
  }

  asBlobMessage(): BlobInvokeMessage | null {
    if (this.type === MessageType.BLOB) {
      return this as unknown as BlobInvokeMessage;
    }
    return null;
  }

  asVariableInvokeMessage(): VariableInvokeMessage | null {
    if (this.type === MessageType.VARIABLE) {
      return this as unknown as VariableInvokeMessage;
    }
    return null;
  }

  asRetrieverResourceInvokeMessage(): RetrieverResourceInvokeMessage | null {
    if (this.type === MessageType.RETRIEVER_RESOURCES) {
      return this as unknown as RetrieverResourceInvokeMessage;
    }
    return null;
  }
}
