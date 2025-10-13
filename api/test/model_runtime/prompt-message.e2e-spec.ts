import { format } from "path";
import { ImagePromptMessageContent, TextPromptMessageContent } from "@/prompt/classes/message-types.class";
import { AssistantPromptMessage, AssistantPromptMessageToolCall, AssistantPromptMessageToolCallFunction } from "@/prompt/classes/messages/assistant-message.class";
import { UserPromptMessage } from "@/prompt/classes/messages/user-message.class";
import { PromptMessage } from "@/prompt/classes/prompt-message.class";
import { PromptMessageContentType, PromptMessageRole } from "@/prompt/enums/prompt-message.enum";
import { PromptMessageRoleUtil } from "@/prompt/utils/message.util";
import { plainToClass } from "class-transformer";

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
            const toolCallFunction = new AssistantPromptMessageToolCallFunction();
            toolCallFunction.name = "get_weather";
            toolCallFunction.arguments = '{"city": "New York"}';

            const toolCall = new AssistantPromptMessageToolCall();
            toolCall.id = "call_123";
            toolCall.type = "function";
            toolCall.function = toolCallFunction;

            const assistantMessage = new AssistantPromptMessage();
            assistantMessage.tool_calls = [toolCall];
            assistantMessage.content = "test";

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

    describe('JSON Parsing Tests', () => {
        it('should correctly parse complete JSON with tool calls', () => {
            // Mock API response JSON data
            const mockApiResponse = {
                role: 'assistant',
                content: 'I will call tools to get weather information',
                tool_calls: [
                    {
                        id: 'call_abc123',
                        type: 'function',
                        function: {
                            name: 'get_weather',
                            arguments: '{"city": "Beijing", "unit": "celsius"}'
                        }
                    },
                    {
                        id: 'call_def456',
                        type: 'function',
                        function: {
                            name: 'get_time',
                            arguments: '{"timezone": "Asia/Shanghai"}'
                        }
                    }
                ]
            }

            // Transform using class-transformer
            const message = plainToClass(AssistantPromptMessage, mockApiResponse)
            // Verify basic properties
            expect(message.role).toBe(PromptMessageRole.ASSISTANT);
            expect(message.content).toBe('I will call tools to get weather information');

            // Verity tool_calls array
            expect(message.tool_calls).toHaveLength(2)
            expect(message.tool_calls[0]).toBeInstanceOf(AssistantPromptMessageToolCall);
            expect(message.tool_calls[1]).toBeInstanceOf(AssistantPromptMessageToolCall);

            // Verify tool_call
            expect(message.tool_calls[0].id).toBe("call_abc123");
            expect(message.tool_calls[0].type).toBe("function");
            expect(message.tool_calls[0].function).toBeInstanceOf(AssistantPromptMessageToolCallFunction)
            expect(message.tool_calls[0].function.name).toBe('get_weather');
            expect(message.tool_calls[0].function.arguments).toBe('{"city": "Beijing", "unit": "celsius"}');

            // Verify second tool_call
            expect(message.tool_calls[1].id).toBe('call_def456');
            expect(message.tool_calls[1].function.name).toBe('get_time');
            expect(message.tool_calls[1].function.arguments).toBe('{"timezone": "Asia/Shanghai"}');
        });

        it('should correctly parse JSON without tool_calls', () => {
            const simpleResponse = {
                role: 'assistant',
                content: 'This is a simple response',
                tool_calls: []
            };

            const message = plainToClass(AssistantPromptMessage, simpleResponse);

            expect(message.role).toBe(PromptMessageRole.ASSISTANT);
            expect(message.content).toBe('This is a simple response');
            expect(message.tool_calls).toHaveLength(0);
            expect(message.isEmpty()).toBe(false); // Because there is content
        });

        it('should correctly parse JSON with only tool_calls and no content', () => {
            const toolCallOnlyResponse = {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call_xyz789',
                        type: 'function',
                        function: {
                            name: 'search_data',
                            arguments: '{"query": "test"}'
                        }
                    }
                ]
            };

            const message = plainToClass(AssistantPromptMessage, toolCallOnlyResponse);

            expect(message.role).toBe(PromptMessageRole.ASSISTANT);
            expect(message.content).toBeNull();
            expect(message.tool_calls).toHaveLength(1);
            expect(message.isEmpty()).toBe(false); // Because there are tool_calls
        });

        it('should correctly handle empty JSON', () => {
            const emptyResponse = {
                role: 'assistant',
                content: '',
                tool_calls: []
            };

            const message = plainToClass(AssistantPromptMessage, emptyResponse);

            expect(message.role).toBe(PromptMessageRole.ASSISTANT);
            expect(message.content).toBe('');
            expect(message.tool_calls).toHaveLength(0);
            expect(message.isEmpty()).toBe(true); // Empty content and no tool_calls
        });

        it('should handle complex function arguments JSON', () => {
            const complexResponse = {
                role: 'assistant',
                content: 'Processing complex parameters',
                tool_calls: [
                    {
                        id: 'call_complex_001',
                        type: 'function',
                        function: {
                            name: 'create_report',
                            arguments: JSON.stringify({
                                title: 'Monthly Report',
                                data: [1, 2, 3, 4, 5],
                                metadata: {
                                    author: 'AI Assistant',
                                    created_at: '2024-01-01',
                                    tags: ['monthly', 'analysis']
                                }
                            })
                        }
                    }
                ]
            };

            const message = plainToClass(AssistantPromptMessage, complexResponse);

            expect(message.tool_calls[0].function.arguments).toBe(complexResponse.tool_calls[0].function.arguments);

            // Verify arguments can be parsed as JSON
            const parsedArgs = JSON.parse(message.tool_calls[0].function.arguments);
            expect(parsedArgs.title).toBe('Monthly Report');
            expect(parsedArgs.data).toEqual([1, 2, 3, 4, 5]);
            expect(parsedArgs.metadata.author).toBe('AI Assistant');
        });
    })

    describe('Edge Case Tests', () => {
        it('should handle missing optional properties', () => {
            const minimalResponse = {
                role: 'assistant'
                // content and tool_calls are missing
            };

            const message = plainToClass(AssistantPromptMessage, minimalResponse);

            expect(message.role).toBe(PromptMessageRole.ASSISTANT);
            expect(message.content).toBeUndefined();
            expect(message.tool_calls).toEqual([]); // Should use default value
        });

        it('should handle undefined and null values in tool_calls', () => {
            const responseWithNulls = {
                role: 'assistant',
                content: 'Test content',
                tool_calls: [
                    null,
                    {
                        id: 'call_valid_001',
                        type: 'function',
                        function: {
                            name: 'valid_function',
                            arguments: '{}'
                        }
                    },
                    undefined
                ].filter(Boolean) // Remove null/undefined
            };

            const message = plainToClass(AssistantPromptMessage, responseWithNulls);

            expect(message.tool_calls).toHaveLength(1);
            expect(message.tool_calls[0].id).toBe('call_valid_001');
        });

        it('should preserve method functionality after transformation', () => {
            const responseWithContent = {
                role: 'assistant',
                content: 'Hello World',
                tool_calls: []
            };

            const message = plainToClass(AssistantPromptMessage, responseWithContent);

            // Verify that class methods work correctly
            expect(message.isEmpty()).toBe(false);
            expect(message.role).toBe(PromptMessageRole.ASSISTANT);

            // Test modifying properties
            message.content = 'Updated content';
            expect(message.content).toBe('Updated content');
        });
    });
});