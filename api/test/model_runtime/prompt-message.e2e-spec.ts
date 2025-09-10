import { TextPromptMessageContent } from "src/prompt/classes/message-types.class";
import { AssistantPromptMessage } from "src/prompt/classes/messages/assistant-message.class";
import { PromptMessageRole } from "src/prompt/enums/prompt-message.enum";
import { PromptMessageRoleUtil } from "src/prompt/utils/message.util";

describe("PromptMessage (e2e)", () => {
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

    describe('PromptMessage', () => {
        const textContent = new TextPromptMessageContent();
        textContent.data = "hello, world";

        expect(textContent.data.length).toBe(12);

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