import { InvokeAuthorizationError, InvokeBadRequestError, InvokeConnectionError, InvokeRateLimitError, InvokeServiceUnavailableError } from "./invoke-error.type";

/**
 * 所有LLM异常的基类
 */
export class InvokeError extends Error {
    description?: string;

    constructor(description?: string) {
        super(description || 'InvokeError');
        this.name = 'InvokeError';
        this.description = description;

        // 保持正确的原型链
        Object.setPrototypeOf(this, InvokeError.prototype);
    }

    toString(): string {
        return this.description || this.name;
    }
}

// 所有异常类型
export type InvokeException =
    | InvokeError
    | InvokeAuthorizationError
    | InvokeBadRequestError
    | InvokeConnectionError
    | InvokeRateLimitError
    | InvokeServiceUnavailableError;