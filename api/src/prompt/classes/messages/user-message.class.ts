import { PromptMessageRole } from "src/prompt/enums/prompt-message.enum";
import { PromptMessage } from "../prompt-message.class";

export class UserPromptMessage extends PromptMessage {
    role: PromptMessageRole = PromptMessageRole.USER;
}
