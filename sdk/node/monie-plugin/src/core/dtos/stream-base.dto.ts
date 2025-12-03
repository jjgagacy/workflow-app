import { StreamRequestEvent } from "../entities/event.enum";

export abstract class StreamBaseData {
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