export interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  [key: string]: any;
}
export type Response = Record<string, any>;

export function parseRawHttpRequest(rawRequest: string): Request {
  const [firstLine, ...headerLines] = rawRequest.split('\r\n');
  const [method, path] = (firstLine || '').split(' ');

  return {
    method: method || 'GET',
    path: path || '/',
    headers: headerLines.reduce((headers, line) => {
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key] = value;
      }
      return headers;
    }, {} as Record<string, string>),
    query: {}
  };
}

export function pathToRegexp(pattern: string): { regex: RegExp; paramNames: string[] } {
  throw new Error('Not impl');
}

export function matchMethods(requestMethod: string, allowedMethods: string[]): boolean {
  return allowedMethods.includes(requestMethod.toUpperCase());
}

export function matchPath(
  requestPath: string,
  pattern: string
): { matched: boolean; params: Record<string, string> } {
  throw new Error('Not impl');
}
