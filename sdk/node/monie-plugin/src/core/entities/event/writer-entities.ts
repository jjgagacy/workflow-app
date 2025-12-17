export enum Event {
  LOG = 'log',
  ERROR = 'error',
  SESSION = 'session',
  HEARTBEAT = 'heartbeat',
}

export class StreamOutputMessage {
  event: Event;
  sessionId: string | null = null;
  data: Record<string, any> | null = null;

  constructor(
    event: Event,
    sessionId: string | null = null,
    data: Record<string, any> | null = null,
  ) {
    this.event = event;
    this.sessionId = sessionId;
    this.data = data;
  }
}
