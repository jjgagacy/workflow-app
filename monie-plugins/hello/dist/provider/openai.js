"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const monie_plugin_1 = require("monie-plugin");
class OpenAIProvider extends monie_plugin_1.ModelProvider {
    validateProviderCredentials(credentials) {
        throw new Error("Method not implemented.");
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.js.map