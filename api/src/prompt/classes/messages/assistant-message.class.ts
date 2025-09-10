import { PromptMessageRole } from "src/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";
import { Type } from "class-transformer";


export class AssistantPromptMessage extends PromptMessage {
    role: PromptMessageRole = PromptMessageRole.ASSISTANT;

    static ToolCallFunction = class {
        name: string;

        arguments: string;
    }

    static ToolCall = class {
        id: string;

        type: string;

        function: InstanceType<typeof AssistantPromptMessage.ToolCallFunction>;
    }


    @Type(() => AssistantPromptMessage.ToolCall)
    tool_calls: InstanceType<typeof AssistantPromptMessage.ToolCall>[] = [];

    isEmpty(): boolean {
        if (!super.isEmpty() || this.tool_calls.length > 0) {
            return false;
        }
        return true;
    }
}

