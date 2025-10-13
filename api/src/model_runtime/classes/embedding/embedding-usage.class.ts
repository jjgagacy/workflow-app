import { ModelUsage } from "../model-usage.class";

/**
 * 嵌入模型使用量计费信息
 */
export class TextEmbeddingUsage extends ModelUsage {
    // 输入token数量，处理文本消耗的token数
    tokens: number = 0;
    // 总token数量，本次调用token消耗
    totalTokens: number = 0;
    // 单价
    unitPrice: number = 0;
    // 计价单位，每多少token计费（如1000）
    pricePerUnit: number = 0;
    // 本次调用总费用
    totalPrice: number = 0;
    // 获取类型，如USD，CNY
    currency: string = 'USD';
    // 模型处理时间（毫秒）
    latency: number = 0;

    static emptyUsage(): TextEmbeddingUsage {
        return new TextEmbeddingUsage();
    }

    static fromMetadata(record: Record<string, any>): TextEmbeddingUsage {
        const usage = new TextEmbeddingUsage();
        usage.tokens = record?.tokens || 0;
        usage.totalTokens = record?.totalTokens || 0;
        usage.unitPrice = parseFloat(record?.unitPrice?.toString() || '0');
        usage.pricePerUnit = parseFloat(record?.pricePerUnit?.toString() || '0');
        usage.totalPrice = parseFloat(record?.totalPrice?.toString() || '0');
        usage.currency = record?.currency || "USD";
        usage.latency = record?.latency || 0;
        return usage;
    }

    plus(other: TextEmbeddingUsage): TextEmbeddingUsage {
        const usage = new TextEmbeddingUsage();
        usage.tokens = this.tokens + other.tokens;
        usage.totalTokens = this.totalTokens + other.totalTokens;
        usage.unitPrice = other.unitPrice;
        usage.pricePerUnit = other.pricePerUnit;
        usage.totalPrice = this.totalPrice + other.totalPrice;
        usage.currency = other.currency;
        usage.latency = this.latency + other.latency;
        return usage;
    }
}