import { AssistantPromptMessage } from "src/prompt/classes/messages/assistant-message.class";
import { LLMUsage } from "./llm-usage.class";
import { PromptMessage } from "src/prompt/classes/prompt-message.class";
import { IsOptional } from "class-validator";
import { PriceInfo } from "../model-runtime.class";

/**
 * LLM 调用结果类
 */
export class LLMResult {
    id?: string;

    // 模型名称
    model: string;

    // 提示消息列表
    prompt_message: PromptMessage[] = [];

    // 助手返回消息
    message: AssistantPromptMessage;

    // 用量统计信息
    usage: LLMUsage;

    // 系统指纹标识
    system_fingerprint: string;
}


/**
 * 大模型结构化输出
 */
export class LLMStructuredOutput {
    structuredOutput: Record<string, any>;
}

/**
 * 大模型结构化输出结果类
 */
export class LLMStructureResult extends LLMResult {
    @IsOptional()
    structuredOutput?: Record<string, any>;
}

/**
 * 流式输出增量
 */
export class LLMChunkDeltaResult {
    // 数据块索引
    index: number = 0;

    // 增量消息内容
    message: AssistantPromptMessage;

    // 增量用量
    @IsOptional()
    usage?: LLMUsage;

    // 完成原因
    @IsOptional()
    finishReason?: string;
}

/**
 * 流式输出数据块
 */
export class LLMChunkResult {
    // 模型名称
    model: string;

    // 提示消息
    promptMessage: PromptMessage[] = [];

    // 系统指纹
    @IsOptional()
    systemFingerprint?: string = '';

    // 增量数据
    delta: LLMChunkDeltaResult;
}

/**
 * 带结构化输出的流式数据块
 */
export class LLMStructureChunkResult extends LLMChunkResult {
    @IsOptional()
    structuredOutput?: Record<string, any>;
}

/**
 * Token数量结果
 */
export class PriceTokensResult extends PriceInfo {
    tokens: number;
}

