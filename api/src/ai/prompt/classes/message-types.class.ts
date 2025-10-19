import { ImageDetail, PromptMessageContentType } from "../enums/prompt-message.enum";
import { PromptMessageContent } from "./abstract.class";

export class TextPromptMessageContent extends PromptMessageContent {
    type: PromptMessageContentType.TEXT = PromptMessageContentType.TEXT;

    data: string;
}

export abstract class MultiModelPromptMessageContent extends PromptMessageContent {
    format: string;

    base64_data: string = '';

    url = '';

    mime_type: string;

    get data(): string {
        return this.url || `data:${this.mime_type};base64,${this.base64_data}`;
    }
}

export class VideoPromptMessageContent extends PromptMessageContent {
    type: PromptMessageContentType.VIDEO = PromptMessageContentType.VIDEO;
}

export class AudioPromptMessageContent extends PromptMessageContent {
    type: PromptMessageContentType.AUDIO = PromptMessageContentType.AUDIO;
}

export class ImagePromptMessageContent extends MultiModelPromptMessageContent {
    type: PromptMessageContentType.IMAGE = PromptMessageContentType.IMAGE;

    detail: ImageDetail = ImageDetail.LOW;
}

export class DocumentPromptMessageContent extends MultiModelPromptMessageContent {
    type: PromptMessageContentType.DOCUMENT = PromptMessageContentType.DOCUMENT;
}

export type PromptMessageContentUnionTypes = 
    | TextPromptMessageContent
    | ImagePromptMessageContent
    | DocumentPromptMessageContent
    | AudioPromptMessageContent
    | VideoPromptMessageContent;

export const CONTENT_TYPE_MAPPING: Record<PromptMessageContentType, any> = {
    [PromptMessageContentType.TEXT]: TextPromptMessageContent,
    [PromptMessageContentType.IMAGE]: ImagePromptMessageContent,
    [PromptMessageContentType.AUDIO]: AudioPromptMessageContent,
    [PromptMessageContentType.VIDEO]: VideoPromptMessageContent,
    [PromptMessageContentType.DOCUMENT]: DocumentPromptMessageContent,
};

