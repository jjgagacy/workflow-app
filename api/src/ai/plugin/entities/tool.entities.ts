import { CredentialType } from "@/ai/model_runtime/classes/plugin/oauth";
import { FileMessage, JsonMessage, LogMessage, LogStatus, MessageType, RetrievalSourceMetadata, RetrieverResourceMessage, TextMessage, VariableMessage } from "./message.entities";

export enum ToolInvokeMessageType {
  BLOB = 'blob',
  BLOB_CHUNK = 'blob_chunk',
}

export interface BlobChunkMessage {
  id: string;
  sequence: number;
  totalLength: number;
  blob: Uint8Array;
  end: boolean;
}

export interface BlobMessage {
  blob: Uint8Array;
}

export interface ToolInvokeData {
  provider: string;
  tool: string;
  credentials: Record<string, any>;
  credentialType: CredentialType;
  toolParameters: Record<string, any>;
}

export interface ToolInvokeRequest {
  userId: string;
  conversationId?: string;
  appId?: string;
  messageId?: string;
  data: ToolInvokeData;
}

class FileChunk {
  bytesWritten: number;
  totalLength: number;
  data: Uint8Array;

  constructor(totalLength: number) {
    this.bytesWritten = 0;
    this.totalLength = totalLength;
    this.data = new Uint8Array(totalLength);
  }
}

export class ToolInvokeMessage {
  type: MessageType;
  message:
    | JsonMessage
    | TextMessage
    | BlobChunkMessage
    | BlobMessage
    | LogMessage
    | FileMessage
    | null
    | VariableMessage
    | RetrieverResourceMessage;
  meta?: Record<string, any> | null;

  constructor(type: MessageType, message: any, meta?: Record<string, any> | null) {
    this.type = type;
    this.message = message;
    this.meta = meta ?? null;
  }

  // Static factory methods for creating different message types
  static text(text: string, meta?: Record<string, any>): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.TEXT,
      { text } as TextMessage,
      meta
    );
  }

  static json(jsonObject: Record<string, any>, meta?: Record<string, any>): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.JSON,
      { jsonObject: jsonObject } as JsonMessage,
      meta
    );
  }

  static blob(blob: Uint8Array, meta?: Record<string, any>): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.BLOB,
      { blob } as BlobMessage,
      meta
    );
  }

  static blobChunk(
    id: string,
    sequence: number,
    totalLength: number,
    blob: Uint8Array,
    end: boolean,
    meta?: Record<string, any>
  ): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.BLOB_CHUNK,
      { id, sequence, totalLength, blob, end } as BlobChunkMessage,
      meta
    );
  }

  static variable(
    variableName: string,
    variableValue: string | number | boolean | Record<string, any> | any[],
    stream: boolean = false,
    meta?: Record<string, any>
  ): ToolInvokeMessage {
    // Validate variable name
    if (variableName === 'json' || variableName === 'text' || variableName === 'files') {
      throw new Error(`The variable name '${variableName}' is reserved.`);
    }

    // Validate variable value
    const isValidType =
      typeof variableValue === 'string' ||
      typeof variableValue === 'number' ||
      typeof variableValue === 'boolean' ||
      Array.isArray(variableValue) ||
      (typeof variableValue === 'object' && variableValue !== null && !Array.isArray(variableValue));

    if (!isValidType) {
      throw new Error('Only basic types and lists are allowed.');
    }

    // If stream is true, value must be a string
    if (stream && typeof variableValue !== 'string') {
      throw new Error("When 'stream' is true, 'variable_value' must be a string.");
    }

    return new ToolInvokeMessage(
      MessageType.VARIABLE,
      { variableName: variableName, variableValue: variableValue, stream } as VariableMessage,
      meta
    );
  }

  static log(
    id: string,
    label: string,
    status: LogStatus,
    data: Record<string, any>,
    parentId?: string | null,
    error?: string | null,
    metadata?: Record<string, any> | null
  ): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.LOG,
      { id, label, status, data, parentId, error, metadata } as LogMessage,
      undefined
    );
  }

  static retrieverResources(
    retrieverResources: RetrievalSourceMetadata[],
    context: string,
    meta?: Record<string, any>
  ): ToolInvokeMessage {
    return new ToolInvokeMessage(
      MessageType.RETRIEVER_RESOURCES,
      { retrieverResources: retrieverResources, context } as RetrieverResourceMessage,
      meta
    );
  }

  // Serialize to JSON (for sending over network)
  toJSON(): any {
    const result: any = {
      type: this.type,
    };

    if (this.message) {
      // Handle blob encoding
      if (this.type === MessageType.BLOB && (this.message as BlobMessage).blob) {
        const blobMessage = this.message as BlobMessage;
        result.message = {
          blob: this.blobToBase64(blobMessage.blob)
        };
      }
      // Handle blob chunk encoding
      else if (this.type === MessageType.BLOB_CHUNK && (this.message as BlobChunkMessage).blob) {
        const chunkMessage = this.message as BlobChunkMessage;
        result.message = {
          id: chunkMessage.id,
          sequence: chunkMessage.sequence,
          totalLength: chunkMessage.totalLength,
          blob: this.blobToBase64(chunkMessage.blob),
          end: chunkMessage.end
        };
      }
      else {
        result.message = this.message;
      }
    }

    if (this.meta) {
      result.meta = this.meta;
    }

    return result;
  }

  // Static method to create from JSON (for receiving from network)
  static fromJSON(data: any): ToolInvokeMessage {
    let message = data.message;

    // Handle blob decoding
    if (data.type === MessageType.BLOB && message && typeof message.blob === 'string') {
      message = {
        ...message,
        blob: ToolInvokeMessage.base64ToBlob(message.blob)
      };
    }
    // Handle blob chunk decoding
    else if (data.type === MessageType.BLOB_CHUNK && message && typeof message.blob === 'string') {
      message = {
        ...message,
        blob: ToolInvokeMessage.base64ToBlob(message.blob)
      };
    }

    return new ToolInvokeMessage(data.type, message, data.meta);
  }

  // Helper methods for blob conversion
  private blobToBase64(blob: Uint8Array): string {
    return Buffer.from(blob).toString('base64');
  }

  private static base64ToBlob(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}