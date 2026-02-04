import { AIModel, EmbeddingInputType, PriceInfo, PriceType, TextEmbeddingModel, TextEmbeddingResult } from "monie-plugin";
export declare class OpenAITextEmbeddingModel extends TextEmbeddingModel {
    invoke(model: string, credentials: Record<string, any>, texts: string[], user: string | undefined, inputType: EmbeddingInputType): Promise<TextEmbeddingResult> | TextEmbeddingResult;
    getNumTokens(model: string, credentials: Record<string, any>, texts: string[]): Promise<number> | number;
    getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo;
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=text_embedding.d.ts.map