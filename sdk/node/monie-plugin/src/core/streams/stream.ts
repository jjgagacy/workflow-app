import { RequestReader } from "../reader.class.js";
import type { Event } from "../entities/event/writer-entities.js";
import type { SessionMessage } from "../entities/event/message.js";

export interface StreamReader {
  read(data: any): Promise<any>;
  stop(): Promise<void>;
}

export interface StreamWriter {
  write(data: any): Promise<void>;
  close(): Promise<void>;
  put(event: Event, sessionId?: string | null, data?: Record<string, any> | null): void;
  error(sessionId?: string | null, data?: Record<string, any> | null): void;
  log(data: Record<string, any> | null): void;
  heartbeat(): void;
  sessionMessage(sessionId?: string | null, data?: Record<string, any> | null): void;
  sessionMessageText(sessionId?: string | null, data?: Record<string, any> | null): string;
  streamObject(data: Record<string, any>): SessionMessage;
  streamEndObject(): SessionMessage;
  streamErrorObject(data: Record<string, any>): SessionMessage;
  streamInvokeObject(data: Record<string, any>): SessionMessage;
}

export interface StreamPair {
  reader: RequestReader;
  writer: StreamWriter;
}
