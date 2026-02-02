import { StreamRequestEvent } from "../entities/event.enum.js";

export abstract class StreamRequestPayload {
  constructor(
    public sessionId: string,
    public event: StreamRequestEvent,
    public data: Record<string, any>,
    public conversationId?: string,
    public messageId?: string,
    public appId?: string,
    public endpointId?: string,
    public context?: Record<string, any>,
  ) { }
}

export class StreamMessage extends StreamRequestPayload {
  constructor(
    sessionId: string,
    event: StreamRequestEvent,
    data: Record<string, any>,
    conversationId?: string,
    messageId?: string,
    appId?: string,
    endpointId?: string,
    context?: Record<string, any>,
  ) {
    super(sessionId, event, data, conversationId, messageId, appId, endpointId, context);
  }
}
