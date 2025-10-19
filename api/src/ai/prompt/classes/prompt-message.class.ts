import { IsOptional } from "class-validator";
import { PromptMessageRole } from "../enums/prompt-message.enum";
import { CONTENT_TYPE_MAPPING, MultiModelPromptMessageContent, PromptMessageContentUnionTypes, TextPromptMessageContent } from "./message-types.class";
import { PromptMessageContent } from "./abstract.class";
import { safeForOf } from "@/common/utils/for-of";

export class PromptMessageTool {
    name: string;

    description: string;

    parameters: Record<string, string>;
}

export class PromptMessageFunction {
    function: PromptMessageTool;
}

export abstract class PromptMessage {
    role: PromptMessageRole;

    @IsOptional()
    content?: string | PromptMessageContentUnionTypes[];

    @IsOptional()
    name?: string;

    isEmpty(): boolean {
        return !this.content;
    }

    getTextContent(): string {
        if (typeof this.content === 'string') {
            return this.content;
        } else if (Array.isArray(this.content)) {
            const texts: string[] = [];
            for (const item of this.content) {
                if (item instanceof TextPromptMessageContent) {
                    texts.push(item.data);
                }
            }
            return texts.join('');
        } else {
            return '';
        }
    }

    static validateContent(content: any): any {
        if (Array.isArray(content)) {
            const prompts: PromptMessageContentUnionTypes[] = [];
            safeForOf(content, function (prompt: any) {
                let validatedPrompt: PromptMessageContentUnionTypes;

                if (prompt instanceof PromptMessageContent) {
                    if (!(prompt instanceof TextPromptMessageContent || prompt instanceof MultiModelPromptMessageContent)) {
                        const ContentClass = CONTENT_TYPE_MAPPING[prompt.type];
                        validatedPrompt = Object.assign(new ContentClass(), prompt) as PromptMessageContentUnionTypes;
                    } else {
                        validatedPrompt = prompt as PromptMessageContentUnionTypes;
                    }
                } else if (typeof prompt === 'object' && prompt !== null) {
                    const ContentClass = CONTENT_TYPE_MAPPING[prompt.type];
                    validatedPrompt = Object.assign(new ContentClass(), prompt) as PromptMessageContentUnionTypes;
                } else {
                    throw new Error(`Invalid prompt message: ${prompt}`);
                }
                prompts.push(validatedPrompt);
            })
            return prompts;
        }
        return content;
    }

    // 序列化方法
    serializeContent(): string | object[] | undefined {
        if (this.content === undefined || typeof this.content === 'string') {
            return this.content;
        }

        if (Array.isArray(this.content)) {
            return this.content.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return { ...item };
                }
                return item;
            });
        }

        return this.content;
    }

}

