type ErrorData = {
  [key: string]: any
};

const errorObject = (message: string | string[], errors?: ErrorData) => {
  return {
    message,
    errors,
  };
};

const errorDetail = (data: ErrorData) => {
  const code = data.statusCode || 400;
  const message = data.message || 'Unknown Message';
  const error =
    typeof data.error === 'string'
      ? data.error
      : data.error?.key || 'Unknown Error';
  return `StatusCode: ${code}, Message: ${message}, Error: ${error}`;
};

export { errorObject, errorDetail, ErrorData };
