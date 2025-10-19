/**
 * 重排序文档类
 */
export class RerankDocument {
    // 原始索引，文档在输入列表中的原始位置
    index: number;
    // 被重排序的文本内容
    text: string;
    // 相关度分数（与查询的相关性得分（0-1或0-100））
    score: number;
}

