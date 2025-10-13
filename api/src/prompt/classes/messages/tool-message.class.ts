import { PromptMessageRole } from "@/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";

export class ToolPromptMessage extends PromptMessage {
    role: PromptMessageRole = PromptMessageRole.TOOL;
    toolCallId: string;

    isEmtpy(): boolean {
        if (!super.isEmpty() || this.toolCallId) {
            return false;
        }
        return true;
    }
}