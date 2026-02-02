import EventEmitter from "events";
import { StreamWriter } from "./streams/stream.js";
import { Event, StreamOutputMessage } from "./entities/event/writer-entities.js";
import { SessionMessage, SessionMessageType } from "./entities/event/message.js";

export abstract class ResponseWriter extends EventEmitter implements StreamWriter {
  abstract write(data: string): Promise<void>;
  abstract close(): Promise<void>;

  put(
    event: Event,
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ): void {
    const message = new StreamOutputMessage(event, sessionId, data);
    this.write(JSON.stringify(message));
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

    return JSON.stringify(message) + "\n\n";
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
