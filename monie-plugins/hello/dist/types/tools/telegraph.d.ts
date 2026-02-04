import { Tool, ToolInvokeMessage, ToolParameter } from "monie-plugin";
export declare class TelegraphTool extends Tool {
    invoke(toolParameters: Record<string, any>): Promise<ToolInvokeMessage>;
    getRuntimeParameters(): Promise<ToolParameter[]>;
}
//# sourceMappingURL=telegraph.d.ts.map