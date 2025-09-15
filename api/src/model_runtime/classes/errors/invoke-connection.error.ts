import { InvokeError } from "./invoke.error";

/**
 * 当调用返回连接错误时抛出
 */
export class InvokeConnectionError extends InvokeError {
    constructor(description?: string) {
        super(description || 'Connection Error');
        this.name = 'InvokeConnectionError';

        Object.setPrototypeOf(this, InvokeConnectionError.prototype);
    }
}

/**
 * 当调用返回服务器不可用错误时抛出
 */
export class InvokeServiceUnavailableError extends InvokeError {
    constructor(description?: string) {
        super(description || 'Service Unavailable Error');
        this.name = 'InvokeServiceUnavailableError';

        Object.setPrototypeOf(this, InvokeServiceUnavailableError.prototype);
    }
}

/**
 * 当调用返回速率限制错误时抛出
 */
export class InvokeRateLimitError extends InvokeError {
    constructor(description?: string) {
        super(description || 'Rate Limit Error');
        this.name = 'InvokeRateLimitError';

        Object.setPrototypeOf(this, InvokeRateLimitError.prototype);
    }
}

/**
 * 当调用返回授权错误时抛出
 */
export class InvokeAuthorizationError extends InvokeError {
    constructor(description?: string) {
        super(description || 'Incorrect model credentials provided, please check and try again.');
        this.name = 'InvokeAuthorizationError';

        Object.setPrototypeOf(this, InvokeAuthorizationError.prototype);
    }
}

/**
 * 当调用返回错误请求时抛出
 */
export class InvokeBadRequestError extends InvokeError {
    constructor(description?: string) {
        super(description || 'Bad Request Error');
        this.name = 'InvokeBadRequestError';

        Object.setPrototypeOf(this, InvokeBadRequestError.prototype);
    }
}
