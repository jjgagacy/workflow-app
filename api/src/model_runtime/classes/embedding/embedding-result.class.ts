import { TextEmbeddingUsage } from "./embedding-usage.class";

export type EmbeddingVector = number[][];

/**
 * 文本嵌入结果
 */
export class TextEmbeddingResult {
    // 模型名称
    model: string;
    // 嵌入向量
    embedding: EmbeddingVector;
    // 本次调用用量统计
    usage: TextEmbeddingUsage;
}