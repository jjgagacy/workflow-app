import { PromptMessageContentType } from "../enums/prompt-message.enum";

export abstract class PromptMessageContent {
    abstract type: PromptMessageContentType;
}