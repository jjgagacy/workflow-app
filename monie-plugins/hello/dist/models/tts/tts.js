"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIText2SpeechModel = void 0;
const tts_model_1 = require("@/interfaces/model/tts.model");
class OpenAIText2SpeechModel extends tts_model_1.TTSModel {
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