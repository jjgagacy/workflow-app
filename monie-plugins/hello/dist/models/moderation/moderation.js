"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIModerationModel = void 0;
const monie_plugin_1 = require("monie-plugin");
class OpenAIModerationModel extends monie_plugin_1.ModerationModel {
    getModelSchema(model, credentials) {
        throw new Error("Method not implemented.");
    }
    validateCredentials(model, credentials) {
        throw new Error("Method not implemented.");
    }
}
exports.OpenAIModerationModel = OpenAIModerationModel;
//# sourceMappingURL=moderation.js.map