const errorObject = (message: string | string[], data?: any) => {
  return {
    message,
    error: data,
  };
};

const errorDetail = (data: any) => {
  const code = data.statusCode || 400;
  const message = data.message || 'Unknown Message';
  const error =
    typeof data.error === 'string'
      ? data.error
      : data.error?.key || 'Unknown Error';
  return `StatusCode: ${code}, Message: ${message}, Error: ${error}`;
};

export { errorObject, errorDetail };
