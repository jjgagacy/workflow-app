"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeErrorMapping = void 0;
exports.mapToInvokeError = mapToInvokeError;
const monie_plugin_1 = require("monie-plugin");
const openai_1 = __importDefault(require("openai"));
exports.invokeErrorMapping = new Map([
    [
        monie_plugin_1.InvokeConnectionError,
        [openai_1.default.APIConnectionError, openai_1.default.APIConnectionTimeoutError],
    ],
    [
        monie_plugin_1.InvokeServerUnavailableError,
        [openai_1.default.InternalServerError]
    ],
    [
        monie_plugin_1.InvokeRateLimitError,
        [openai_1.default.RateLimitError],
    ],
    [
        monie_plugin_1.InvokeAuthorizationError,
        [openai_1.default.AuthenticationError, openai_1.default.PermissionDeniedError],
    ],
    [
        monie_plugin_1.InvokeBadRequestError,
        [openai_1.default.BadRequestError, openai_1.default.NotFoundError, openai_1.default.UnprocessableEntityError, openai_1.default.APIError]
    ]
]);
function mapToInvokeError(error) {
    for (const [InvokeErr, openaiErr] of exports.invokeErrorMapping) {
        if (openaiErr.some(e => error instanceof e)) {
            return new InvokeErr(error.message);
        }
    }
    return new monie_plugin_1.InvokeError(error instanceof Error ? error.message : String(error));
}
//# sourceMappingURL=error.js.map