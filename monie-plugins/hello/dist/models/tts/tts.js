import { TTSModel } from "monie-plugin";
export class OpenAIText2SpeechModel extends TTSModel {
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
//# sourceMappingURL=tts.js.map