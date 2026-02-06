import { TextEmbeddingModel } from "monie-plugin";
export class OpenAITextEmbeddingModel extends TextEmbeddingModel {
    invoke(model, credentials, texts, user, inputType) {
        throw new Error("Method not implemented.");
    }
    getNumTokens(model, credentials, texts) {
        throw new Error("Method not implemented.");
    }
    getPrice(model, credentials, priceType, tokens) {
        throw new Error("Method not implemented.");
    }
    getModelSchema(model, credentials) {
        throw new Error("Method not implemented.");
    }
    validateCredentials(model, credentials) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=text_embedding.js.map