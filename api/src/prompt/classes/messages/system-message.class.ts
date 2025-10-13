import { PromptMessageRole } from "@/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";

export class SystemPromptMessage extends PromptMessage {
    type: PromptMessageRole = PromptMessageRole.SYSTEM;
}
