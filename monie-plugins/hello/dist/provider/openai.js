"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const model_provider_1 = require("@/interfaces/model/model-provider");
class OpenAIProvider extends model_provider_1.ModelProvider {
    validateProviderCredentials(credentials) {
        throw new Error("Method not implemented.");
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.js.map