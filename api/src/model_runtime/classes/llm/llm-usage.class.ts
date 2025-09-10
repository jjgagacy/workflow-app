import { ModelUsage } from "../model-usage.class";

/**
 * LLM 使用量统计
 */
export class LLMUsage extends ModelUsage {
    // 提示词token数量
    prompt_tokens: number = 0;

    // 提示词单价（每token价格）
    prompt_unit_price: number = 0;

    // 提示词计价单位（通常是每千token）
    prompt_price_per_unit: number = 0;

    // 提示词总费用
    prompt_price: number = 0;

    // 补全token数量
    completion_tokens: number = 0;

    // 补全单价
    completion_unit_price: number = 0;

    // 补全计价单位（通常是每千token）
    completion_price_per_unit: number = 0;

    // 补全总费用
    completion_price: number = 0;

    // 总token数量
    total_tokens: number = 0;

    // 总费用
    total_price: number = 0;

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
        let total_tokens = record?.total_tokens || 0;
        let completion_tokens = record?.completion_tokens || 0;
        if (total_tokens > 0 && completion_tokens === 0) {
            completion_tokens = total_tokens;
        }

        const usage = new LLMUsage();
        usage.prompt_tokens = record?.prompt_tokens || 0;
        usage.completion_tokens = completion_tokens;
        usage.total_tokens = total_tokens;
        usage.prompt_unit_price = parseFloat(record?.prompt_unit_price?.toString() || '0');
        usage.completion_unit_price = parseFloat(record?.completion_unit_price?.toString() || '0');
        usage.total_price = parseFloat(record?.total_price?.toString() || '0');
        usage.currency = record?.currency || "USD";
        usage.prompt_price_per_unit = parseFloat(record?.prompt_price_per_unit?.toString() || '0');
        usage.completion_price_per_unit = parseFloat(record?.completion_price_per_unit?.toString() || '0');
        usage.prompt_price = parseFloat(record?.prompt_price?.toString() || '0');
        usage.completion_price = parseFloat(record?.completion_price?.toString() || '0');
        usage.latency = record?.latency || 0;

        return usage;
    }

    plus(other: LLMUsage): LLMUsage {
        if (this.total_tokens === 0) {
            return other;
        }

        const usage = new LLMUsage();
        usage.prompt_tokens = this.prompt_tokens + other.prompt_tokens;
        usage.prompt_unit_price = other.prompt_unit_price;
        usage.prompt_price_per_unit = other.prompt_price_per_unit;
        usage.prompt_price = this.prompt_price + other.prompt_price;
        usage.completion_tokens = this.completion_tokens + other.completion_tokens;
        usage.completion_unit_price = other.completion_unit_price;
        usage.completion_price_per_unit = other.completion_price_per_unit;
        usage.completion_price = this.completion_price + other.completion_price;
        usage.total_tokens = this.total_tokens + other.total_tokens;
        usage.total_price = this.total_price + other.total_price;
        usage.currency = other.currency;
        usage.latency = this.latency + other.latency;

        return usage;
    }
}