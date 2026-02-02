"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegraphTool = void 0;
const message_dto_1 = require("@/core/dtos/message.dto");
const invoke_message_1 = require("@/interfaces/tool/invoke-message");
const tool_1 = require("@/interfaces/tool/tool");
class TelegraphTool extends tool_1.Tool {
    async invoke(toolParameters) {
        const { content, title } = toolParameters;
        if (!content) {
            throw new Error("Content parameter is required");
        }
        // Create Telegraph article and return the public URL
        const articleUrl = `https://telegra.ph/${Date.now()}`;
        return new invoke_message_1.ToolInvokeMessage({
            type: message_dto_1.MessageType.TEXT,
            message: articleUrl,
            timestamp: new Date(),
        });
    }
    async getRuntimeParameters() {
        return [];
    }
}
exports.TelegraphTool = TelegraphTool;
//# sourceMappingURL=telegraph.js.map