"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegraphProvider = void 0;
const monie_plugin_1 = require("monie-plugin");
class TelegraphProvider extends monie_plugin_1.ToolProvider {
    async validateCredentials(credentials) {
        if (!credentials.accessToken) {
            throw new Error("Telegraph access token is required");
        }
        if (typeof credentials.accessToken !== "string") {
            throw new Error("Telegraph access token must be a string");
        }
        if (credentials.accessToken.trim().length === 0) {
            throw new Error("Telegraph access token cannot be empty");
        }
    }
}
exports.TelegraphProvider = TelegraphProvider;
//# sourceMappingURL=telegraph.js.map