"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Duck = void 0;
const monie_plugin_1 = require("monie-plugin");
class Duck extends monie_plugin_1.Endpoint {
    async invoke(r, values, settings) {
        const duckSounds = ["quack", "quack-quack", "quaaaack"];
        const randomSound = duckSounds[Math.floor(Math.random() * duckSounds.length)];
        return monie_plugin_1.ToolInvokeMessage.createJson({
            statusCode: 200,
            body: {
                message: `Duck says: ${randomSound}`,
                timestamp: new Date().toISOString()
            }
        });
    }
}
exports.Duck = Duck;
//# sourceMappingURL=duck.js.map