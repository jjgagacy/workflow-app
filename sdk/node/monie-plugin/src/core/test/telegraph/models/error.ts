import { InvokeError, InvokeConnectionError, InvokeServerUnavailableError, InvokeRateLimitError, InvokeAuthorizationError, InvokeBadRequestError } from "@/core/errors/model.error.js";

// 定义基础错误类
class BaseError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// OpenAI 错误类 - 都支持 new (...args: any[])
class APIConnectionError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'APIConnectionError';
  }
}

class APIConnectionTimeoutError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'APIConnectionTimeoutError';
  }
}

class InternalServerError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'InternalServerError';
  }
}

class RateLimitError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class AuthenticationError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class PermissionDeniedError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

class BadRequestError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'BadRequestError';
  }
}

class NotFoundError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnprocessableEntityError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'UnprocessableEntityError';
  }
}

class APIError extends BaseError {
  constructor(message?: string, options?: any) {
    super(message);
    this.name = 'APIError';
  }
}
// 模拟 OpenAI 命名空间
const OpenAI = {
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
  RateLimitError,
  AuthenticationError,
  PermissionDeniedError,
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
  APIError
} as const;

// 类型定义
type OpenAIErrorType =
  | typeof APIConnectionError
  | typeof APIConnectionTimeoutError
  | typeof InternalServerError
  | typeof RateLimitError
  | typeof AuthenticationError
  | typeof PermissionDeniedError
  | typeof BadRequestError
  | typeof NotFoundError
  | typeof UnprocessableEntityError
  | typeof APIError;

type InvokeErrorType =
  | typeof InvokeConnectionError
  | typeof InvokeServerUnavailableError
  | typeof InvokeRateLimitError
  | typeof InvokeAuthorizationError
  | typeof InvokeBadRequestError;


export const invokeErrorMapping: Map<
  new (...args: any[]) => InvokeError,
  Array<new (...args: any[]) => Error>
> = new Map([
  [
    InvokeConnectionError,
    [APIConnectionError, APIConnectionTimeoutError],
  ],
  [
    InvokeServerUnavailableError,
    [InternalServerError]
  ],
  [
    InvokeRateLimitError,
    [RateLimitError],
  ],
  [
    InvokeAuthorizationError,
    [AuthenticationError, PermissionDeniedError],
  ],
  [
    InvokeBadRequestError,
    [BadRequestError, NotFoundError, UnprocessableEntityError, APIError]
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
