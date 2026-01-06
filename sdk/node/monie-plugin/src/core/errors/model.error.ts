
export class InvokeError extends Error { }

export class InvokeConnectionError extends InvokeError { }
export class InvokeServerUnavailableError extends InvokeError { }
export class InvokeRateLimitError extends InvokeError { }
export class InvokeAuthorizationError extends InvokeError { }
export class InvokeBadRequestError extends InvokeError { }
