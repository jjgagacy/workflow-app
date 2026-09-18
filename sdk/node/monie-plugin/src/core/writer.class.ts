import EventEmitter from "events";
import { StreamWriter } from "./streams/stream.js";
import { Event, StreamOutputMessage } from "./entities/event/writer-entities.js";
import { SessionMessage, SessionMessageType } from "./entities/event/message.js";
import { deepCamelToSnake } from "../utils/string.util.js";

function toPlainObject(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toPlainObject);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const plain: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      plain[key] = toPlainObject(item);
    }
    return plain;
  }

  return value;
}

export abstract class ResponseWriter extends EventEmitter implements StreamWriter {
  abstract write(data: string): Promise<void>;
  abstract close(): Promise<void>;

  put(
    event: Event,
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ): void {
    const message = new StreamOutputMessage(event, sessionId, data);
    const payload = deepCamelToSnake({
      event: message.event,
      sessionId: message.sessionId,
      data: message.data,
    });
    this.write(JSON.stringify(payload));
    this.write("\n\n");
  }

  error(
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ): void {
    return this.put(Event.ERROR, sessionId, data);
  }

  log(data: Record<string, any> | null): void {
    return this.put(Event.LOG, null, data);
  }

  heartbeat(): void {
    return this.put(Event.HEARTBEAT);
  }

  sessionMessage(
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ): void {
    return this.put(Event.SESSION, sessionId, data);
  }

  sessionMessageText(
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ): string {
    const message = new StreamOutputMessage(Event.SESSION, sessionId, data);
    const payload = deepCamelToSnake({
      event: message.event,
      sessionId: message.sessionId,
      data: toPlainObject(message.data),
    });

    return JSON.stringify(payload) + "\n\n";
  }

  streamObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(SessionMessageType.STREAM, data);
  }

  streamEndObject(): SessionMessage {
    return new SessionMessage(SessionMessageType.END, {});
  }

  streamErrorObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(SessionMessageType.ERROR, data);
  }

  streamInvokeObject(data: Record<string, any>): SessionMessage {
    return new SessionMessage(SessionMessageType.INVOKE, data);
  }
}
