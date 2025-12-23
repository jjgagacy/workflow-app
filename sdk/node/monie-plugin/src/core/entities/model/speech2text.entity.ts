export type AudioFile = Buffer | ArrayBuffer | Uint8Array | string | NodeJS.ReadableStream;

export interface Speech2TextOptions {
  language?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Speech2TextResult {
  text: string;
  language?: string;
  confidence?: number;
  segments?: Array<TranscriptionSegment>;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}