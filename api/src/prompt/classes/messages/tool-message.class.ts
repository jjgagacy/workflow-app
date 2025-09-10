import { PromptMessageRole } from "src/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";

export class ToolPromptMessage extends PromptMessage {
    role: PromptMessageRole = PromptMessageRole.TOOL;

    tool_call_id: string;

    isEmtpy(): boolean {
        if (!super.isEmpty() || this.tool_call_id) {
            return false;
        }
        return true;
    }
}