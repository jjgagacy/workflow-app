import 'reflect-metadata';
import { PromptMessageRole } from "@/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";
import { Type } from "class-transformer";

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
