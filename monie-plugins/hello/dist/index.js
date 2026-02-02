"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("node:path")); // 方式1：使用 node: 协议
const path_1 = __importDefault(require("path")); // 方式2：常规导入
const path3 = require('path'); // 方式3：CommonJS 方式
// class TelegraphMain extends Plugin {
//   constructor() {
//     super(__dirname)
//   }
const lib_js_1 = require("./lib.js");
//   protected isCPUTask(message: StreamMessage): boolean {
//     return false;
//   }
// }
// process.chdir(__dirname);
// const telegraph = new TelegraphMain();
// telegraph.run();
// new IOServer();
// class B extends Plugin {
// }
class A {
    foo;
    constructor() {
        this.foo = 'foo';
    }
}
const a = new A();
console.log((0, lib_js_1.add)());
console.log('测试导入:', {
    path: typeof path,
    path2: typeof path_1.default,
    path3: typeof path3
});
//# sourceMappingURL=index.js.map