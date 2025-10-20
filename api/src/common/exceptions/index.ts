import { GraphqlErrorCodes } from "../constants/graphql-error-codes";
import { GraphQLException } from "./graphql.exception";

// 认证授权相关异常
export class UnauthorizedGraphQLException extends GraphQLException {
    constructor(message: string = '未经授权的访问', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.UNAUTHORIZED, extensions);
    }
}

export class ForbiddenGraphQLException extends GraphQLException {
    constructor(message: string = '访问被禁止', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.FORBIDDEN, extensions);
    }
}

export class InvalidTokenGraphQLException extends GraphQLException {
    constructor(message: string = '无效的令牌', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.INVALID_TOKEN, extensions);
    }
}

export class TokenExpiredGraphQLException extends GraphQLException {
    constructor(message: string = '令牌已过期', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.TOKEN_EXPIRED, extensions);
    }
}

// 输入验证相关异常
export class BadRequestGraphQLException extends GraphQLException {
    constructor(message: string = '请求参数错误', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.BAD_REQUEST, extensions);
    }
}

export class ValidationGraphQLException extends GraphQLException {
    constructor(message: string = '数据验证失败', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.VALIDATION_ERROR, extensions);
    }
}

export class InvalidInputGraphQLException extends GraphQLException {
    constructor(message: string = '输入数据无效', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.INVALID_INPUT, extensions);
    }
}

// 资源操作相关异常
export class NotFoundGraphQLException extends GraphQLException {
    constructor(message: string = '资源未找到', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.NOT_FOUND, extensions);
    }
}

export class AlreadyExistsGraphQLException extends GraphQLException {
    constructor(message: string = '资源已存在', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.ALREADY_EXISTS, extensions);
    }
}

export class ConflictGraphQLException extends GraphQLException {
    constructor(message: string = '资源冲突', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.CONFLICT, extensions);
    }
}

// 限制相关异常
export class TooManyRequestsGraphQLException extends GraphQLException {
    constructor(message: string = '请求过于频繁', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.TOO_MANY_REQUESTS, extensions);
    }
}

export class RateLimitExceededGraphQLException extends GraphQLException {
    constructor(message: string = '请求频率超限', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.RATE_LIMIT_EXCEEDED, extensions);
    }
}

// 业务逻辑相关异常
export class InsufficientPermissionsGraphQLException extends GraphQLException {
    constructor(message: string = '权限不足', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.INSUFFICIENT_PERMISSIONS, extensions);
    }
}

export class OperationNotAllowedGraphQLException extends GraphQLException {
    constructor(message: string = '操作不被允许', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.OPERATION_NOT_ALLOWED, extensions);
    }
}

// 支付相关异常
export class PaymentRequiredGraphQLException extends GraphQLException {
    constructor(message: string = '需要支付', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.PAYMENT_REQUIRED, extensions);
    }
}

export class PaymentFailedGraphQLException extends GraphQLException {
    constructor(message: string = '支付失败', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.PAYMENT_FAILED, extensions);
    }
}

// 服务器错误相关异常
export class InternalServerGraphQLException extends GraphQLException {
    constructor(message: string = '服务器内部错误', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.INTERNAL_SERVER_ERROR, extensions);
    }
}

export class ServiceUnavailableGraphQLException extends GraphQLException {
    constructor(message: string = '服务暂不可用', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.SERVICE_UNAVAILABLE, extensions);
    }
}

export class DatabaseGraphQLException extends GraphQLException {
    constructor(message: string = '数据库错误', extensions?: Record<string, any>) {
        super(message, GraphqlErrorCodes.DATABASE_ERROR, extensions);
    }
}
