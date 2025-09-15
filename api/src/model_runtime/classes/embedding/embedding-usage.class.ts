import { ModelUsage } from "../model-usage.class";

/**
 * 嵌入模型使用量计费信息
 */
export class TextEmbeddingUsage extends ModelUsage {
    // 输入token数量，处理文本消耗的token数
    tokens: number = 0;
    // 总token数量，本次调用token消耗
    total_tokens: number = 0;
    // 单价
    unit_price: number = 0;
    // 计价单位，每多少token计费（如1000）
    price_per_unit: number = 0;
    // 本次调用总费用
    total_price: number = 0;
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
        usage.total_tokens = record?.total_tokens || 0;
        usage.unit_price = parseFloat(record?.unit_price?.toString() || '0');
        usage.price_per_unit = parseFloat(record?.price_per_unit?.toString() || '0');
        usage.total_price = parseFloat(record?.total_price?.toString() || '0');
        usage.currency = record?.currency || "USD";
        usage.latency = record?.latency || 0;
        return usage;
    }

    plus(other: TextEmbeddingUsage): TextEmbeddingUsage {
        const usage = new TextEmbeddingUsage();
        usage.tokens = this.tokens + other.tokens;
        usage.total_tokens = this.total_tokens + other.total_tokens;
        usage.unit_price = other.unit_price;
        usage.price_per_unit = other.price_per_unit;
        usage.total_price = this.total_price + other.total_price;
        usage.currency = other.currency;
        usage.latency = this.latency + other.latency;
        return usage;
    }
}