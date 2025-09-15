import { format } from "path";
import { ImagePromptMessageContent, TextPromptMessageContent } from "src/prompt/classes/message-types.class";
import { AssistantPromptMessage } from "src/prompt/classes/messages/assistant-message.class";
import { UserPromptMessage } from "src/prompt/classes/messages/user-message.class";
import { PromptMessage } from "src/prompt/classes/prompt-message.class";
import { PromptMessageContentType, PromptMessageRole } from "src/prompt/enums/prompt-message.enum";
import { PromptMessageRoleUtil } from "src/prompt/utils/message.util";

describe("PromptMessage (e2e)", () => {
    let promptMessage: PromptMessage;

    beforeEach(() => {
        promptMessage = new UserPromptMessage();
    });

    describe("PromptMessageRole", () => {
        it('PromptMessageRoleUtil::valueOf()', () => {
            const tool = PromptMessageRoleUtil.valueOf('tool');
            expect(tool).toBe(PromptMessageRole.TOOL);
        });

        it('PromptMessageRoleUtil::valueOf() throw error', () => {
            expect(() => {
                const noExist = PromptMessageRoleUtil.valueOf("no-exists");
            }).toThrow();
        });
    });

    describe('PromptMessage tool call function', () => {

        it('should return text content unchanged', () => {
            const textContent = new TextPromptMessageContent();
            textContent.data = "hello, world";

            expect(textContent.data.length).toBe(12);
        });

        it('should handle AssistantPromptMessage isEmpty method', () => {
            // 创建工具调用消息
            const toolCallFunction = new AssistantPromptMessage.ToolCallFunction();
            toolCallFunction.name = "get_weather";
            toolCallFunction.arguments = '{"city": "New York"}';

            const toolCall = new AssistantPromptMessage.ToolCall();
            toolCall.id = "call_123";
            toolCall.type = "function";
            toolCall.function = toolCallFunction;

            const assistantMessage = new AssistantPromptMessage();
            assistantMessage.tool_calls = [toolCall];

            expect(assistantMessage.isEmpty()).toBe(false);
        });
    });

    describe('validateContent method', () => {
        it('should return string content unchanged', () => {
            const content = 'hello world';
            const result = PromptMessage.validateContent(content);
            expect(result).toBe(content);
        });

        it('should return undefined content unchanged', () => {
            const result = PromptMessage.validateContent(undefined);
            expect(result).toBeUndefined();
        });

        it('should validate and convert array of TextPromptMessageContent objects', () => {
            const content = [
                { type: PromptMessageContentType.TEXT, data: 'hello' },
                { type: PromptMessageContentType.TEXT, data: 'world' }
            ];

            const result = PromptMessage.validateContent(content);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(TextPromptMessageContent);
            expect(result[1]).toBeInstanceOf(TextPromptMessageContent);
            expect(result[0].data).toBe('hello');
            expect(result[1].data).toBe('world');
        });

        it('should validate and convert array of ImagePromptMessageContent objects', () => {
            const content = [
                {
                    type: PromptMessageContentType.IMAGE,
                    format: 'jpeg',
                    mime_type: 'image/jpeg',
                    base64_data: 'base64data123',
                    url: '',
                }
            ];
            const result = PromptMessage.validateContent(content);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(ImagePromptMessageContent);
            expect(result[0].type).toBe(PromptMessageContentType.IMAGE);
            expect(result[0].format).toBe('jpeg');
            expect(result[0].mime_type).toBe('image/jpeg');
        });

        it('should handle mixed content types in array', () => {
            const content = [
                { type: PromptMessageContentType.TEXT, data: 'hello' },
                {
                    type: PromptMessageContentType.IMAGE,
                    format: 'jpeg',
                    mime_type: 'image/jpeg',
                    base64_data: 'base64data123'
                }
            ];

            const result = PromptMessage.validateContent(content);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(TextPromptMessageContent);
            expect(result[1]).toBeInstanceOf(ImagePromptMessageContent);
            expect(result[0].data).toBe('hello');
            expect(result[1].type).toBe(PromptMessageContentType.IMAGE);
        });

        it('should handle already instantiated content objects', () => {
            const textContent = new TextPromptMessageContent();
            textContent.data = 'hello';

            const imageContent = new ImagePromptMessageContent();
            imageContent.format = 'jpeg';
            imageContent.mime_type = 'image/jpeg';
            imageContent.base64_data = 'base64data123';

            const content = [textContent, imageContent];

            const result = PromptMessage.validateContent(content);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(textContent);
            expect(result[1]).toBe(imageContent);
        });

        it('should throw error for invalid content type in array', () => {
            const content = [
                { type: 'invalid-type', data: 'test' }
            ];

            expect(() => {
                PromptMessage.validateContent(content);
            }).toThrow('ContentClass is not a constructor');
        });

        it('should throw error for non-object content in array', () => {
            const content = [123, 'string'];

            expect(() => {
                PromptMessage.validateContent(content);
            }).toThrow('Invalid prompt message: 123');
        });

        it('should handle empty array', () => {
            const content: any[] = [];
            const result = PromptMessage.validateContent(content);
            expect(result).toEqual([]);
        });

        it('should handle null content', () => {
            const result = PromptMessage.validateContent(null);
            expect(result).toBeNull();
        });

        it('should handle number content', () => {
            const result = PromptMessage.validateContent(123);
            expect(result).toBe(123);
        });

        it('should handle boolean content', () => {
            const result = PromptMessage.validateContent(true);
            expect(result).toBe(true);
        });
    });

    describe('serializeContent method', () => {
        it('should return string content unchanged', () => {
            promptMessage.content = 'hello world';
            const result = promptMessage.serializeContent();
            expect(result).toBe('hello world');
        });

        it('should return undefined when content is undefined', () => {
            promptMessage.content = undefined;
            const result = promptMessage.serializeContent();
            expect(result).toBeUndefined();
        });

        it('should serialize array of content objects to plain objects', () => {
            const textContent = new TextPromptMessageContent();
            textContent.data = 'hello';

            const imageContent = new ImagePromptMessageContent();
            imageContent.format = 'jpeg';
            imageContent.mime_type = 'image/jpeg';
            imageContent.base64_data = 'base64data123';

            promptMessage.content = [textContent, imageContent];
            const result = promptMessage.serializeContent();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result![0]).toEqual({ type: PromptMessageContentType.TEXT, data: 'hello' });
            expect(result![1]).toEqual({
                type: PromptMessageContentType.IMAGE,
                format: 'jpeg',
                mime_type: 'image/jpeg',
                base64_data: 'base64data123',
                url: '',
                detail: 'low'
            });
        });

        it('should handle non-object items in content array', () => {
            promptMessage.content = ['string', 123] as any;
            const result = promptMessage.serializeContent();
            expect(result).toEqual(['string', 123]);
        })
    });

    describe('integration with isEmpty and getTextContent', () => {
        it('should work correctly with validated content for isEmpty', () => {
            const content = [
                { type: PromptMessageContentType.TEXT, data: 'hello' }
            ];
            promptMessage.content = PromptMessage.validateContent(content);
            expect(promptMessage.isEmpty()).toBe(false);
        });

        it('should work correctly with validated content for getTextContent', () => {
            const content = [
                { type: PromptMessageContentType.TEXT, data: 'hello' },
                { type: PromptMessageContentType.TEXT, data: ' world' },
            ];

            promptMessage.content = PromptMessage.validateContent(content);
            expect(promptMessage.getTextContent()).toBe('hello world');
        });

        it('should ignore non-text content in getTextContent', () => {
            const content = [
                { type: PromptMessageContentType.TEXT, data: 'hello' },
                {
                    type: PromptMessageContentType.IMAGE,
                    format: 'jpeg',
                    mime_type: 'image/jpeg',
                    base64_data: 'base64data123',
                }
            ];

            promptMessage.content = PromptMessage.validateContent(content);
            expect(promptMessage.getTextContent()).toBe('hello');
        });
    });
});