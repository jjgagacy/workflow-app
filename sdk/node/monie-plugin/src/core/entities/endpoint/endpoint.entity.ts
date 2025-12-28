export interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, string>;
  [key: string]: any;
}

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
    body: {},
    query: {}
  };
}

/**
 * Its function is to convert a path pattern string containing parameters (similar to 
 * "/user/:id/profile") into a regular expression and a list of parameter names. This is
 * very useful for building routing system, such as matching paths and extracting parameters
 * in web frameworks
 * @param pattern 
 */
export function pathToRegexp(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

  const regexStr = pattern
    .replace(/\/:([^\/]+)/g, (_, name) => {
      paramNames.push(name);
      return '/([^/]+)';
    })
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexStr}$`);
  return { regex, paramNames };
}

export function matchMethods(requestMethod: string, allowedMethods: string[]): boolean {
  return allowedMethods.includes(requestMethod.toUpperCase());
}

export function matchPath(
  requestPath: string,
  pattern: string
): { matched: boolean; params: Record<string, string> } {
  const { regex, paramNames } = pathToRegexp(pattern);
  const match = requestPath.match(regex);

  if (!match) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1] || '';
  });

  return { matched: true, params };
}
