"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegraphTool = void 0;
const monie_plugin_1 = require("monie-plugin");
class TelegraphTool extends monie_plugin_1.Tool {
    async invoke(toolParameters) {
        const { content, title } = toolParameters;
        if (!content) {
            throw new Error("Content parameter is required");
        }
        // Create Telegraph article and return the public URL
        const articleUrl = `https://telegra.ph/${Date.now()}`;
        return new monie_plugin_1.ToolInvokeMessage({
            type: monie_plugin_1.MessageType.TEXT,
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