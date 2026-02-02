"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAISpeech2TextModel = void 0;
const speech2text_model_1 = require("@/interfaces/model/speech2text.model");
class OpenAISpeech2TextModel extends speech2text_model_1.Speech2TextModel {
    invoke(model, credentials, file, user, options) {
        throw new Error("Method not implemented.");
    }
    getModelSchema(model, credentials) {
        throw new Error("Method not implemented.");
    }
    validateCredentials(model, credentials) {
        throw new Error("Method not implemented.");
    }
}
exports.OpenAISpeech2TextModel = OpenAISpeech2TextModel;
//# sourceMappingURL=speech2text.js.map