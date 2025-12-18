import { RequestReader } from "../reader.class";
import { ResponseWriter } from "../writer.class";

export class InvokeCredentials {
  toolCredentials: Record<string, string> = {};
}

export class SessionContext {
  credentials: InvokeCredentials = new InvokeCredentials();
  metadata?: Record<string, any> = {};
}

export class Session {
  sessionId: string;

  reader: RequestReader;
  writer: ResponseWriter;

  conversationId: string | null = null;
  messageId: string | null = null;
  appId: string | null = null;
  endpointId: string | null = null;

  context: SessionContext;

  pluginDaemonUrl: string | null = null;

  constructor(
    sessionId: string,
    reader: RequestReader,
    writer: ResponseWriter,
    conversationId?: string,
    messageId?: string,
    appId?: string,
    endpointId?: string,
    context: SessionContext | Record<string, any> | null = null,
    pluginDaemonUrl?: string
  ) {
    this.sessionId = sessionId;
    this.reader = reader;
    this.writer = writer;
    this.conversationId = conversationId || null;
    this.messageId = messageId || null;
    this.appId = appId || null;
    this.endpointId = endpointId || null;
    this.pluginDaemonUrl = pluginDaemonUrl || null;

    if (context instanceof SessionContext) {
      this.context = context;
    } else if (context && typeof context === 'object') {
      this.context = new SessionContext();
      Object.assign(this.context, context);
    } else {
      this.context = new SessionContext();
    }

    this.registerInvocations();
  }

  private registerInvocations(): void {
    // Register invocation-related logic here
  }
}