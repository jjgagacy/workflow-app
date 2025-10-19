import 'reflect-metadata';
import { PromptMessage } from "../prompt-message.class";
import { Type } from "class-transformer";
import { PromptMessageRole } from '../../enums/prompt-message.enum';

export class AssistantPromptMessageToolCallFunction {
    name: string;
    arguments: string;
}

export class AssistantPromptMessageToolCall {
    id: string;
    type: string;

    @Type(() => AssistantPromptMessageToolCallFunction)
    function: AssistantPromptMessageToolCallFunction;
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
