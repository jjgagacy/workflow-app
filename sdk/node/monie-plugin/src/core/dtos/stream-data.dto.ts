import { StreamRequestEvent } from "../entities/event.enum";
import { RequestReader } from "../reader.class";
import { ResponseWriter } from "../writer.class";
import { StreamBaseData } from "./stream-base.dto";

export class StreamData extends StreamBaseData {
  constructor(
    sessionId: string,
    event: StreamRequestEvent,
    data: Record<string, any>,
    public reader: RequestReader,
    public writer: ResponseWriter,
    conversationId?: string,
    messageId?: string,
    appId?: string,
    endpointId?: string,
    context?: Record<string, any>,
  ) {
    super(sessionId, event, data, conversationId, messageId, appId, endpointId, context);
  }
}
