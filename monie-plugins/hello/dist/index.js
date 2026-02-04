"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monie_plugin_1 = require("monie-plugin");
class TelegraphMain extends monie_plugin_1.Plugin {
    constructor() {
        super(__dirname);
    }
    isCPUTask(message) {
        return false;
    }
}
process.chdir(__dirname);
const telegraph = new TelegraphMain();
telegraph.run();
//# sourceMappingURL=index.js.map