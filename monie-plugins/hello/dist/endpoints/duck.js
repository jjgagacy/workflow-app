"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Duck = void 0;
const endpoint_1 = require("@/interfaces/endpoint/endpoint");
const invoke_message_1 = require("@/interfaces/tool/invoke-message");
class Duck extends endpoint_1.Endpoint {
    async invoke(r, values, settings) {
        return invoke_message_1.ToolInvokeMessage.createText(`id: ${values.appId}`);
    }
}
exports.Duck = Duck;
//# sourceMappingURL=duck.js.map