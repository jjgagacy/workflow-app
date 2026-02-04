"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIText2SpeechModel = void 0;
const monie_plugin_1 = require("monie-plugin");
class OpenAIText2SpeechModel extends monie_plugin_1.TTSModel {
    invoke(model, tenantId, credentials, contextText, voice, user) {
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
exports.OpenAIText2SpeechModel = OpenAIText2SpeechModel;
//# sourceMappingURL=tts.js.map