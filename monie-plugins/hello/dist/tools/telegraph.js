import { MessageType, Tool, ToolInvokeMessage } from "monie-plugin";
export class TelegraphTool extends Tool {
    invoke(toolParameters) {
        const { content, title } = toolParameters;
        if (!content) {
            throw new Error("Content parameter is required");
        }
        // Create Telegraph article and return the public URL
        const articleUrl = `https://telegra.ph/${Date.now()}`;
        // jj1:
        if (title === '1') {
            return this.streamInvoke(toolParameters);
        }
        return this.singleInvoke(toolParameters);
    }
    async singleInvoke(toolParameters) {
        return new ToolInvokeMessage({
            type: MessageType.JSON,
            message: { jsonObject: { result: 'success', params: toolParameters } },
            meta: { timestamp: Date.now() },
            id: crypto.randomUUID(),
        });
    }
    async *streamInvoke(toolParameters) {
        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            yield new ToolInvokeMessage({
                type: MessageType.TEXT,
                message: { text: `Stream chunk ${i + 1}: ${JSON.stringify(toolParameters)}` },
                meta: { chunk: i }
            });
        }
    }
    async getRuntimeParameters() {
        return [];
    }
}
//# sourceMappingURL=telegraph.js.map