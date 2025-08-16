interface IGraphQLError {
  message: string;
  extensions?: {
    statusCode?: number;
    [key: string]: any;
  };
}

interface INormalizedError {
  message: string;
  statusCode?: number;
  details?: any;
}

/**
 * 统一错误处理函数
 * @param error 捕获的错误对象
 * @returns 标准化错误对象
 */
export function handleError(error: any): INormalizedError {
  // 1. 处理GraphQL错误
  if (error.graphQLErrors?.[0]) {
    const gqlError = error.graphQLErrors[0] as IGraphQLError;
    return {
      message: gqlError.message,
      statusCode: gqlError.extensions?.statusCode,
      details: gqlError.extensions,
    };
  }

  // 2. 处理网络错误
  if (error.networkError) {
    return {
      message: "Network Error",
      statusCode: 500,
    };
  }

  // 3. 处理可能是JSON字符串的错误消息
  if (typeof error.message === "string") {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.message) {
        return {
          message: parsed.message,
          statusCode: parsed.statusCode,
          details: parsed.details,
        };
      }
    } catch {
      // 不是JSON字符串，继续处理
    }
  }

  // 4. 处理普通错误对象
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  // 5. 处理未知错误类型
  return {
    message: String(error),
    statusCode: 500,
  };
}

/**
 * 获取错误消息字符串
 * @param error 错误对象
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: any): string {
  return handleError(error).message;
}