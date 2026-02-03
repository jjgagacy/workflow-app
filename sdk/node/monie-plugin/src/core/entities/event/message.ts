export enum SessionMessageType {
  STREAM = 'stream',
  INVOKE = 'invoke',
  END = 'end',
  ERROR = 'error',
}

export enum InitializeMessageType {
  HANDSHAKE = 'handshake',
  ASSET_CHUNK = 'asset_chunk',
  MANIFEST_DECLARATION = 'manifest_declaration',
  TOOL_DECLARATION = "tool_declaration",
  MODEL_DECLARATION = "model_declaration",
  ENDPOINT_DECLARATION = "endpoint_declaration",
  AGENT_STRATEGY_DECLARATION = "agent_strategy_declaration",
  END = "end"
}

export class InitializeMessage {
  type: InitializeMessageType;
  data: Record<string, any>;

  constructor(type: InitializeMessageType, data: Record<string, any>) {
    this.type = type;
    this.data = data;
  }
}

export class SessionMessage {
  type: SessionMessageType;
  data: Record<string, any>;

  constructor(type: SessionMessageType, data: Record<string, any>) {
    this.type = type;
    this.data = data;
  }
}
