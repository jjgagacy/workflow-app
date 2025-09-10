import { LLMUsage } from "./llm-usage.class";

/**
 * LLM 调用结果类
 */
export class LLMResult {
    id?: string;

    // 模型名称
    model: string;

    // 提示消息列表
    // prompt_message: PromptMessage[] = [];

    // 助手返回消息
    // message: AssistantPromptMessage;

    // 用量统计信息
    usage: LLMUsage;

    // 系统指纹标识
    system_fingerprint: string;
}