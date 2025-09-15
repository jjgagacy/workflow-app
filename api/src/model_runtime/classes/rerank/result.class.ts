import { RerankDocument } from "./document.class";

/**
 * 重排序结果类
 */
export class RerankResult {
    // 模型名词
    model: string;
    // 文档列表
    docs: RerankDocument[];
}
