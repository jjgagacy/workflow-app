"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAITextEmbeddingModel = void 0;
const monie_plugin_1 = require("monie-plugin");
class OpenAITextEmbeddingModel extends monie_plugin_1.TextEmbeddingModel {
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
exports.OpenAITextEmbeddingModel = OpenAITextEmbeddingModel;
//# sourceMappingURL=text_embedding.js.map