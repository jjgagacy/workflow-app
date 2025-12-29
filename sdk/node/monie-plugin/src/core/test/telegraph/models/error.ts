import OpenAI from "openai";

export class InvokeError extends Error { }

export class InvokeConnectionError extends InvokeError { }
export class InvokeServerUnavailableError extends InvokeError { }
export class InvokeRateLimitError extends InvokeError { }
export class InvokeAuthorizationError extends InvokeError { }
export class InvokeBadRequestError extends InvokeError { }


export const invokeErrorMapping: Map<
  new (...args: any[]) => InvokeError,
  Array<new (...args: any[]) => Error>
> = new Map([
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

export function mapToInvokeError(error: unknown): InvokeError {
  for (const [InvokeErr, openaiErr] of invokeErrorMapping) {
    if (openaiErr.some(e => error instanceof e)) {
      return new InvokeErr((error as Error).message);
    }
  }
  return new InvokeError(
    error instanceof Error ? error.message : String(error)
  );
}
