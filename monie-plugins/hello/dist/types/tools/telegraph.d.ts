import { Tool, ToolInvokeMessage, ToolParameter } from "monie-plugin";
export declare class TelegraphTool extends Tool {
    invoke(toolParameters: Record<string, any>): AsyncGenerator<ToolInvokeMessage> | Iterable<ToolInvokeMessage> | Promise<ToolInvokeMessage>;
    private singleInvoke;
    private streamInvoke;
    getRuntimeParameters(): Promise<ToolParameter[]>;
}
//# sourceMappingURL=telegraph.d.ts.map