import { ModelType } from "../enums/model-runtime.enum";

export class ModelTypeUtil {
    static valueOf(origin: string): ModelType {
        if (['text-generation', ModelType.LLM].includes(origin)) {
            return ModelType.LLM;
        } else if (['embeddings', ModelType.TEXT_EMBEDDING].includes(origin)) {
            return ModelType.TEXT_EMBEDDING;
        } else if (['reranking', ModelType.RERANK].includes(origin)) {
            return ModelType.RERANK;
        } else if (['speech2text', ModelType.SPEECH2TEXT].includes(origin)) {
            return ModelType.SPEECH2TEXT;
        } else if (['tts', ModelType.TTS].includes(origin)) {
            return ModelType.TTS;
        } else if (origin === ModelType.MODERATION) {
            return ModelType.MODERATION;
        } else {
            throw new Error(`Invalid origin model type: ${origin}`);
        }
    }

    static toValue(modelType: ModelType): string {
        switch (modelType) {
            case ModelType.LLM:
                return 'text-generation';
            case ModelType.TEXT_EMBEDDING:
                return 'embeddings';
            case ModelType.RERANK:
                return 'reranking';
            case ModelType.SPEECH2TEXT:
                return 'speech2text';
            case ModelType.TTS:
                return 'tts';
            case ModelType.MODERATION:
                return 'moderation';
            default:
                throw new Error(`Invalid model type: ${modelType}`);
        }
    }
}