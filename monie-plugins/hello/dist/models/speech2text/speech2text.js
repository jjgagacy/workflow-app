import { Speech2TextModel } from "monie-plugin";
export class OpenAISpeech2TextModel extends Speech2TextModel {
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
//# sourceMappingURL=speech2text.js.map