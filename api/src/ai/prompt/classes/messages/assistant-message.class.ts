import 'reflect-metadata';
import { PromptMessage } from "../prompt-message.class";
import { Type } from "class-transformer";
import { PromptMessageRole } from '../../enums/prompt-message.enum';

export class AssistantPromptMessageToolCallFunction {
  name: string;
  arguments: string;

  constructor(name: string, args: string) {
    this.name = name;
    this.arguments = args;
  }
}

export interface AssistantPromptMessageToolCallProps {
  id: string;
  type: string;
  function: AssistantPromptMessageToolCallFunction;
}

export class AssistantPromptMessageToolCall {
  id: string;
  type: string;

  @Type(() => AssistantPromptMessageToolCallFunction)
  function: AssistantPromptMessageToolCallFunction;

  constructor(props: AssistantPromptMessageToolCallProps) {
    this.id = props.id;
    this.type = props.type;
    this.function = props.function;
  }
}

export class AssistantPromptMessage extends PromptMessage {
  role: PromptMessageRole = PromptMessageRole.ASSISTANT;

  @Type(() => AssistantPromptMessageToolCall)
  tool_calls: AssistantPromptMessageToolCall[] = [];

  isEmpty(): boolean {
    if (!super.isEmpty() || this.tool_calls.length > 0) {
      return false;
    }
    return true;
  }
}
