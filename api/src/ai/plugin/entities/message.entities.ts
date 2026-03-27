export enum LogStatus {
  START = 'start',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface LogMetadata {
  [key: string]: any;
}

export interface LogMessage {
  id: string;
  label: string;
  parentId?: string | undefined;
  error?: string | undefined;
  status?: string | undefined;
  data: Record<string, any>;
  metadata?: LogMetadata | undefined;
}

export interface FileMessage {
}

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

export interface RetrievalSourceMetadata {
  [key: string]: any;
}