import { InvokeAuthorizationError, InvokeBadRequestError, InvokeConnectionError, InvokeError, InvokeRateLimitError, InvokeServerUnavailableError } from "monie-plugin";
import OpenAI from "openai";
export const invokeErrorMapping = new Map([
    [
        InvokeConnectionError,
        [OpenAI.APIConnectionError, OpenAI.APIConnectionTimeoutError],
    ],
    [
        InvokeServerUnavailableError,
        [OpenAI.InternalServerError]
    ],
    [
        InvokeRateLimitError,
        [OpenAI.RateLimitError],
    ],
    [
        InvokeAuthorizationError,
        [OpenAI.AuthenticationError, OpenAI.PermissionDeniedError],
    ],
    [
        InvokeBadRequestError,
        [OpenAI.BadRequestError, OpenAI.NotFoundError, OpenAI.UnprocessableEntityError, OpenAI.APIError]
    ]
]);
export function mapToInvokeError(error) {
    for (const [InvokeErr, openaiErr] of invokeErrorMapping) {
        if (openaiErr.some(e => error instanceof e)) {
            return new InvokeErr(error.message);
        }
    }
    return new InvokeError(error instanceof Error ? error.message : String(error));
}
//# sourceMappingURL=error.js.map