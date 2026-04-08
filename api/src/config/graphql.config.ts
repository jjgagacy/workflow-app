
export const GraphQLFormatError = (formattedError, error) => {
  // console.log('Original error:', error);
  // console.log('Formatted error:', formattedError);
  if (process.env.NODE_ENV === 'production') {
    // 移除堆栈跟踪
    if (formattedError.extensions?.stacktrace) {
      delete formattedError.extensions.stacktrace;
    }
    // 移除其他敏感信息
    if (formattedError.extensions?.exception) {
      delete formattedError.extensions.exception;
    }
    // 隐藏内部错误详情
    if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      return {
        message: 'Internal Server Error',
        path: formattedError.path,
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      };
    }
  }
  return formattedError;
}

export default () => ({})
