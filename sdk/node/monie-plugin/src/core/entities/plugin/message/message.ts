export enum PromptMessageRole {
  SYSTEM = 'sytem',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool',
}

export class PromptMessage {
  role: PromptMessageRole;
  content: string;

  constructor(data: Partial<PromptMessage> = {}) {
    this.role = data.role || PromptMessageRole.USER;
    this.content = data.content || '';
  }

  isEmpty(): boolean {
    return !this.content;
  }
}

export class UserPromptMessage extends PromptMessage {
  role: PromptMessageRole = PromptMessageRole.USER;
}

export class ToolPromptMessage extends PromptMessage {
  role: PromptMessageRole = PromptMessageRole.TOOL;
  toolName: string;
  toolCallId: string;

  constructor(data: Partial<ToolPromptMessage> = {}) {
    super(data);
    this.toolName = data.toolName || '';
    this.toolCallId = data.toolCallId || '';
  }

  isEmtpy(): boolean {
    if (!super.isEmpty() || this.toolCallId) {
      return false;
    }
    return true;
  }
}

export class SystemPromptMessage extends PromptMessage {
  type: PromptMessageRole = PromptMessageRole.SYSTEM;

  constructor(data: Partial<SystemPromptMessage> = {}) {
    super(data);
  }
}

export class AssistantPromptMessageToolCallFunction {
  name: string;
  arguments: string;

  constructor(data: Partial<AssistantPromptMessageToolCallFunction> = {}) {
    this.name = data.name || '';
    this.arguments = data.arguments || '';
  }
}

export class AssistantPromptMessageToolCall {
  id: string;
  type: string;

  function: AssistantPromptMessageToolCallFunction;

  constructor(data: Partial<AssistantPromptMessageToolCall> = {}) {
    this.id = data.id || '';
    this.type = data.type || '';
    this.function = data.function || new AssistantPromptMessageToolCallFunction({});
  }
}

export class AssistantPromptMessage extends PromptMessage {
  role: PromptMessageRole = PromptMessageRole.ASSISTANT;

  tool_calls: AssistantPromptMessageToolCall[] = [];

  constructor(data: Partial<AssistantPromptMessage> = {}) {
    super(data);
  }

  isEmpty(): boolean {
    if (!super.isEmpty() || this.tool_calls.length > 0) {
      return false;
    }
    return true;
  }
}

export class PromptMessageTool {
  name: string;
  description: string;
  parameters: Record<string, string>;

  constructor(data: Partial<PromptMessageTool>) {
    this.name = data.name || '';
    this.description = data.description || '';
    this.parameters = data.parameters || {};
  }
}

export class PromptMessageHelper {
  static convertPromptMessages(messages: any[]): PromptMessage[] {
    if (!Array.isArray(messages)) {
      throw new Error('prompt_messages must be an array');
    }

    return messages.map((message, index) => {
      if (message instanceof PromptMessage) {
        return message;
      }
      if (!message.role) {
        throw new Error(`Message at index ${index} must have a role property`);
      }
      switch (message.role) {
        case PromptMessageRole.USER:
          return Object.assign(new UserPromptMessage(), message);
        case PromptMessageRole.ASSISTANT:
          return Object.assign(new AssistantPromptMessage(), message);
        case PromptMessageRole.SYSTEM:
          return Object.assign(new SystemPromptMessage(), message);
        case PromptMessageRole.TOOL:
          return Object.assign(new ToolPromptMessage(), message);
        default:
          const base = new PromptMessage() as any;
          Object.assign(base, message);
          return base;
      }
    });
  }
}
