"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIModerationModel = void 0;
const moderation_model_1 = require("@/interfaces/model/moderation.model");
class OpenAIModerationModel extends moderation_model_1.ModerationModel {
    getModelSchema(model, credentials) {
        throw new Error("Method not implemented.");
    }
    validateCredentials(model, credentials) {
        throw new Error("Method not implemented.");
    }
}
exports.OpenAIModerationModel = OpenAIModerationModel;
//# sourceMappingURL=moderation.js.map