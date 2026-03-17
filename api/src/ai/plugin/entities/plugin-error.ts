import { PluginDaemonBasicResponse } from "./plugin-daemon";

export class PluginDaemonError extends Error {
  constructor(
    public type: string,
    message: string,
    public code?: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PluginInvokeError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInvokeError.name, description || 'plugin invoke error');
  }
}

export class PluginInvokeRateLimitError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInvokeRateLimitError.name, description || 'plugin rate limit error');
  }
}

export class PluginInvokeServerUnavailableError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInvokeServerUnavailableError.name, description || 'plugin server unavailable error');
  }
}

export class PluginInvokeConnectionError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInvokeConnectionError.name, description || 'plugin connection error');
  }
}

export class PluginInvokeCredentialsValidateFailedError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInvokeCredentialsValidateFailedError.name, description || 'plugin credentials validate failed error');
  }
}

export class PluginInternalServerError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginInternalServerError.name, description || 'plugin internal server error');
  }
}

export class PluginBadRequestError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginBadRequestError.name, description || 'plugin bad request error');
  }
}

export class PluginNotFoundError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginNotFoundError.name, description || 'not found error');
  }
}

export class PluginPluginNotFoundError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginPluginNotFoundError.name, description || 'plugin not found error');
  }
}

export class PluginUniqueIdentifierError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginUniqueIdentifierError.name, description || 'plugin identifier error');
  }
}

export class PluginUnauthorizedError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginUnauthorizedError.name, description || 'plugin unauthorized error');
  }
}

export class PluginPermissionDeniedError extends PluginDaemonError {
  constructor(description?: string) {
    super(PluginPermissionDeniedError.name, description || 'plugin permission denied error');
  }
}

export const PluginErrorTypes = {
  PluginInvokeError: "PluginInvokeError",
  PluginInvokeRateLimitError: "PluginInvokeRateLimitError",
  PluginInvokeServerUnavailableError: "PluginInvokeServerUnavailableError",
  PluginInvokeConnectionError: "PluginInvokeConnectionError",
  PluginInvokeCredentialsValidateFailedError: "PluginInvokeCredentialsValidateFailedError",
  PluginInternalServerError: "PluginInternalServerError",
  PluginBadRequestError: "PluginBadRequestError",
  PluginNotFoundError: "PluginNotFoundError",
  PluginPluginNotFoundError: "PluginPluginNotFoundError",
  PluginUniqueIdentifierError: "PluginUniqueIdentifierError",
  PluginUnauthorizedError: "PluginUnauthorizedError",
  PluginPermissionDeniedError: "PluginPermissionDeniedError"
} as const;

export type PluginErrorType = typeof PluginErrorTypes[keyof typeof PluginErrorTypes];

export enum pluginErrorConstants {
  ErrBadRequest = "ErrMsgBadRequest",
  ErrNotFound = "ErrMsgNotFound",
  ErrInternal = "ErrMsgInternal",
  ErrUniqueIdentifierInvalid = "ErrMsgUniqueIdentifierInvalid",
  ErrUnauthorizedInvalid = "ErrUnauthorizedInvalid",
  ErrPluginNotFound = "ErrPluginNotFound",
  ErrInvokePlugin = "ErrInvokePlugin",
  ErrPermissionDenied = "ErrPermissionDenied"
}

export const pluginErrorToClassMap = {
  [pluginErrorConstants.ErrBadRequest]: PluginBadRequestError,
  [pluginErrorConstants.ErrNotFound]: PluginNotFoundError,
  [pluginErrorConstants.ErrInternal]: PluginInternalServerError,
  [pluginErrorConstants.ErrUniqueIdentifierInvalid]: PluginUniqueIdentifierError,
  [pluginErrorConstants.ErrUnauthorizedInvalid]: PluginUnauthorizedError,
  [pluginErrorConstants.ErrPluginNotFound]: PluginPluginNotFoundError,
  [pluginErrorConstants.ErrInvokePlugin]: PluginInvokeError,
  [pluginErrorConstants.ErrPermissionDenied]: PluginPermissionDeniedError,
} as const;

// Invoke 子错误映射
export const invokeErrorMap: Record<string, new (msg: string) => PluginDaemonError> = {
  [PluginErrorTypes.PluginInvokeRateLimitError]: PluginInvokeRateLimitError,
  [PluginErrorTypes.PluginUnauthorizedError]: PluginUnauthorizedError,
  [PluginErrorTypes.PluginBadRequestError]: PluginBadRequestError,
  [PluginErrorTypes.PluginInvokeConnectionError]: PluginInvokeConnectionError,
  [PluginErrorTypes.PluginInvokeServerUnavailableError]: PluginInvokeServerUnavailableError,
  [PluginErrorTypes.PluginInvokeCredentialsValidateFailedError]: PluginInvokeCredentialsValidateFailedError,
};

export type PluginErrorConstant = keyof typeof pluginErrorConstants;

export function handlePluginError(response: PluginDaemonBasicResponse<any>): never;
export function handlePluginError(errorType: PluginErrorConstant | PluginDaemonBasicResponse<any>, message?: string): never {
  let errorTypeKey: string;
  let messageValue: string;
  if (typeof errorType !== 'string') {
    const message = errorType.message;
    try {
      const errorInfo = JSON.parse(message);
      errorTypeKey = errorInfo.error_type || errorInfo.type;
      messageValue = errorInfo.message || message || '';
    } catch {
      throw new Error(`Unknown plugin error: ${errorType}, message: ${message}`);
    }
  } else {
    errorTypeKey = errorType;
    messageValue = message || '';
  }

  const ErrorClass = pluginErrorToClassMap[errorTypeKey];

  if (ErrorClass) {
    if (errorType === pluginErrorConstants.ErrInvokePlugin) {
      throw handleInvokeError(messageValue);
    }
    // other error
    throw new ErrorClass(messageValue);
  }
  // unknown error type
  throw new Error(`Unknown plugin error: ${errorType}, message: ${messageValue}`);
}

export function handleInvokeError(message: string): PluginDaemonError {
  try {
    const errorObject = JSON.parse(message);
    const invokeErrorType = errorObject.error_type;
    const args = errorObject.args || {};
    const description = args.description || errorObject.message || message;

    const ErrorClass = invokeErrorMap[invokeErrorType];
    if (ErrorClass) {
      return new ErrorClass(description);
    }

    return new PluginInvokeError(description);
  } catch {
    return new PluginInvokeError(message);
  }
}