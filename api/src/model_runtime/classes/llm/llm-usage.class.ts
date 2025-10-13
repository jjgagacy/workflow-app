import { ModelUsage } from "../model-usage.class";

/**
 * LLM 使用量统计
 */
export class LLMUsage extends ModelUsage {
    // 提示词token数量
    promptTokens: number = 0;
    // 提示词单价（每token价格）
    promptUnitPrice: number = 0;
    // 提示词计价单位（通常是每千token）
    promptPricePerUnit: number = 0;
    // 提示词总费用
    promptPrice: number = 0;
    // 补全token数量
    completionTokens: number = 0;
    // 补全单价
    completionUnitPrice: number = 0;
    // 补全计价单位（通常是每千token）
    completionPricePerUnit: number = 0;
    // 补全总费用
    completionPrice: number = 0;
    // 总token数量
    totalTokens: number = 0;
    // 总费用
    totalPrice: number = 0;
    // 货币单位
    currency: string = 'USD';
    // 响应延迟（毫秒）
    latency: number = 0;

    constructor() {
        super();
    }

    static emptyUsage(): LLMUsage {
        return new LLMUsage();
    }

    static fromMetadata(record: Record<string, any>): LLMUsage {
        let totalTokens = record?.totalTokens || 0;
        let completionTokens = record?.completionTokens || 0;
        if (totalTokens > 0 && completionTokens === 0) {
            completionTokens = totalTokens;
        }

        const usage = new LLMUsage();
        usage.promptTokens = parseFloat(record?.promptTokens || '0');
        usage.completionTokens = completionTokens;
        usage.totalTokens = totalTokens;
        usage.promptUnitPrice = parseFloat(record?.promptUnitPrice?.toString() || '0');
        usage.completionUnitPrice = parseFloat(record?.completionUnitPrice?.toString() || '0');
        usage.totalPrice = parseFloat(record?.totalPrice?.toString() || '0');
        usage.currency = record?.currency || "USD";
        usage.promptPricePerUnit = parseFloat(record?.promptPricePerUnit?.toString() || '0');
        usage.completionPricePerUnit = parseFloat(record?.completionPricePerUnit?.toString() || '0');
        usage.promptPrice = parseFloat(record?.promptPrice?.toString() || '0');
        usage.completionPrice = parseFloat(record?.completionPrice?.toString() || '0');
        usage.latency = record?.latency || 0;

        return usage;
    }

    plus(other: LLMUsage): LLMUsage {
        const usage = new LLMUsage();
        usage.promptTokens = this.promptTokens + other.promptTokens;
        usage.promptUnitPrice = other.promptUnitPrice;
        usage.promptPricePerUnit = other.promptPricePerUnit;
        usage.promptPrice = this.promptPrice + other.promptPrice;
        usage.completionTokens = this.completionTokens + other.completionTokens;
        usage.completionUnitPrice = other.completionUnitPrice;
        usage.completionPricePerUnit = other.completionPricePerUnit;
        usage.completionPrice = this.completionPrice + other.completionPrice;
        usage.totalTokens = this.totalTokens + other.totalTokens;
        usage.totalPrice = this.totalPrice + other.totalPrice;
        usage.currency = other.currency;
        usage.latency = this.latency + other.latency;

        return usage;
    }
}