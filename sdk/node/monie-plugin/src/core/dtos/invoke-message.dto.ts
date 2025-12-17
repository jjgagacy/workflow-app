import { LogMessage } from "./log-message.dto";
import { BlobChunkMessage, BlobMessage, JsonMessage, MessageType, RetrieverResourceMessage, TextMessage, VariableMessage } from "./message.dto";

export type InvokeMessageTypeMap = {
  [MessageType.TEXT]: TextMessage;
  [MessageType.JSON]: JsonMessage;
  [MessageType.BLOB]: BlobMessage;
  [MessageType.BLOB_CHUNK]: BlobChunkMessage;
  [MessageType.VARIABLE]: VariableMessage;
  [MessageType.LOG]: LogMessage;
  [MessageType.RETRIEVER_RESOURCES]: RetrieverResourceMessage;
  [MessageType.LINK]: TextMessage;
  [MessageType.IMAGE]: TextMessage;
  [MessageType.IMAGE_LINK]: TextMessage;
  [MessageType.FILE]: any;
};

export type InvokeMessageMeta = Record<string, any>;

export abstract class InvokeMessage<T extends MessageType = MessageType> {
  abstract readonly type: MessageType;
  abstract readonly message: InvokeMessageTypeMap[T];
  readonly id?: string | undefined;
  readonly timestamp: Date = new Date();
  readonly meta?: InvokeMessageMeta | undefined;

  constructor(init?: {
    message: InvokeMessageTypeMap[T];
    type?: T | undefined;
    id?: string | undefined;
    timestamp?: Date;
    meta?: InvokeMessageMeta | undefined;
  }) {
    this.id = init?.id || crypto.randomUUID();
    this.timestamp = init?.timestamp || new Date();
    this.meta = init?.meta;
  }
}

export class TextInvokeMessage extends InvokeMessage<MessageType.TEXT> {
  readonly type = MessageType.TEXT;
  readonly message: TextMessage;

  constructor(message: TextMessage) {
    super();
    this.message = message;
  }
}

export class BlobInvokeMessage extends InvokeMessage<MessageType.BLOB> {
  readonly type = MessageType.BLOB;
  readonly message: BlobMessage;

  constructor(message: BlobMessage, meta?: InvokeMessageMeta) {
    super({ message, meta });
    this.message = message;
  }
}

export class JsonInvokeMessage extends InvokeMessage<MessageType.JSON> {
  readonly type = MessageType.JSON;
  readonly message: JsonMessage;

  constructor(message: JsonMessage) {
    super();
    this.message = message;
  }
}

export class BlobChunkInvokeMessage extends InvokeMessage<MessageType.BLOB_CHUNK> {
  readonly type = MessageType.BLOB_CHUNK;
  readonly message: BlobChunkMessage;

  constructor(message: BlobChunkMessage) {
    super();
    this.message = message;
  }
}

export class VariableInvokeMessage extends InvokeMessage<MessageType.VARIABLE> {
  readonly type = MessageType.VARIABLE;
  readonly message: VariableMessage;

  constructor(message: VariableMessage) {
    super();
    this.message = message;
  }
}

export class RetrieverResourceInvokeMessage extends InvokeMessage<MessageType.RETRIEVER_RESOURCES> {
  readonly type = MessageType.RETRIEVER_RESOURCES;
  readonly message: RetrieverResourceMessage;

  constructor(message: RetrieverResourceMessage) {
    super();
    this.message = message;
  }
}

