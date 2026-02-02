import { ToolParameter } from "@/core/entities/plugin/declaration/tool";
import { ToolInvokeMessage } from "@/interfaces/tool/invoke-message";
import { Tool } from "@/interfaces/tool/tool";
export declare class TelegraphTool extends Tool {
    invoke(toolParameters: Record<string, any>): Promise<ToolInvokeMessage>;
    getRuntimeParameters(): Promise<ToolParameter[]>;
}
//# sourceMappingURL=telegraph.d.ts.map