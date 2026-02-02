import { LogMessage } from "./log-message.dto.js";

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  BLOB = "blob",
  JSON = "json",
  LINK = "link",
  IMAGE = "image",
  IMAGE_LINK = "image_link",
  VARIABLE = "variable",
  BLOB_CHUNK = "blob_chunk",
  LOG = "log",
  RETRIEVER_RESOURCES = "retriever_resources",
}

export interface TextMessage {
  text: string;
}

export interface JsonMessage {
  jsonObject: Record<string, any> | any[];
}

export interface BlobMessage {
  blob: Uint8Array;
}

export interface BlobChunkMessage {
  id: string;
  sequence: number;
  totalLength: number;
  blob: Uint8Array;
  end: boolean;
}

export interface VariableMessage {
  variableName: string;
  variableValue: any;
  stream?: boolean;
}

export interface RetrieverResource {
  position?: number;
  datasetId?: string;
  datasetName?: string;
  documentId?: string;
  documentName?: string;
  dataSourceType?: string;
  segmentId?: string;
  retrieverFrom?: string;
  score?: number;
  hitCount?: number;
  wordCount?: number;
  segmentPosition?: number;
  indexNodeHash?: string;
  content?: string;
  page?: number;
  docMetadata?: Record<string, any>;
}

export interface RetrieverResourceMessage {
  retrieverResources: RetrieverResource[];
  context: string;
}

export type TextMessagePayload = {
  type: MessageType.TEXT;
  message: TextMessage;
};

export type JsonMessagePayload = {
  type: MessageType.JSON;
  message: JsonMessage;
};

export type ImageMessagePayload = {
  type: MessageType.IMAGE;
  message: TextMessage;
};

export type LinkMessagePayload = {
  type: MessageType.LINK;
  message: TextMessage;
};

export type BlobMessagePayload = {
  type: MessageType.BLOB;
  message: BlobMessage;
  meta?: any;
};

export type VariableMessagePayload = {
  type: MessageType.VARIABLE;
  message: VariableMessage;
};

export type LogMessagePayload = {
  type: MessageType.LOG;
  message: LogMessage;
};

export type RetrieverResourceMessagePayload = {
  type: MessageType.RETRIEVER_RESOURCES;
  message: RetrieverResourceMessage;
};

export type InvokeMessagePayload =
  | TextMessagePayload
  | JsonMessagePayload
  | ImageMessagePayload
  | LinkMessagePayload
  | BlobMessagePayload
  | VariableMessagePayload
  | LogMessagePayload
  | RetrieverResourceMessagePayload;

