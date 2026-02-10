import { describe, it, expect } from '@jest/globals';
import { parseRawHttpRequest, pathToRegexp } from "../src/core/entities/endpoint/endpoint.entity.js";

describe('pathToRegexp', () => {
  it('should convert simple path with one parameter', () => {
    const result = pathToRegexp('/user/:id');

    expect(result.regex.toString()).toBe('/^\\/user\\/([^\\/]+)$/');
    expect(result.paramNames).toEqual(['id']);

    const match = '/user/123'.match(result.regex);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe('123');

    expect('/user/123/extra'.match(result.regex)).toBeNull();
    expect('/user/'.match(result.regex)).toBeNull();
  });

  it('should convert path with multiple parameters', () => {
    const result = pathToRegexp('/api/:version/users/:userId');
    expect(result.regex.toString()).toBe('/^\\/api\\/([^\\/]+)\\/users\\/([^\\/]+)$/');
    expect(result.paramNames).toEqual(['version', 'userId']);

    const match = '/api/v1/users/alice'.match(result.regex);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe('v1');
    expect(match?.[2]).toBe('alice');
  });

  describe('Edge cases', () => {
    it('should handle path without parameters', () => {
      const result = pathToRegexp('/static/about');

      expect(result.regex.toString()).toBe('/^\\/static\\/about$/');
      expect(result.paramNames).toEqual([]);

      expect('/static/about'.match(result.regex)).not.toBeNull();
      expect('/static/about/'.match(result.regex)).toBeNull();
    });

    it('should handle consecutive parameters', () => {
      const result = pathToRegexp('/:lang/:page');

      expect(result.regex.toString()).toBe('/^\\/([^\\/]+)\\/([^\\/]+)$/');
      expect(result.paramNames).toEqual(['lang', 'page']);

      const match = '/en/home'.match(result.regex);
      expect(match?.[1]).toBe('en');
      expect(match?.[2]).toBe('home');
    });

    it('should handle empty path', () => {
      const result = pathToRegexp('/');

      expect(result.regex.toString()).toBe('/^\\/$/');
      expect(result.paramNames).toEqual([]);

      expect('/'.match(result.regex)).not.toBeNull();
      expect(''.match(result.regex)).toBeNull();
    });
  });

  describe('Pratical usage scenarios', () => {
    function extractParams(result: ReturnType<typeof pathToRegexp>, path: string) {
      const match = path.match(result.regex);
      if (!match) return null;
      const params: Record<string, string> = {};
      result.paramNames.forEach((name, index) => {
        params[name] = match[index + 1] || '';
      });
      return params;
    }

    it('should work like a simple router', () => {
      const routes = [
        { pattern: '/', handler: 'home' },
        { pattern: '/products/:category', handler: 'category' },
        { pattern: '/products/:category/:id', handler: 'detail' },
      ];

      const compiledRoutes = routes.map(route => ({
        ...route,
        regex: pathToRegexp(route.pattern),
      }));

      const testCases = [
        { path: '/', expectedHandler: 'home', expectedParams: {} },
        { path: '/products/electronics', expectedHandler: 'category', expectedParams: { category: 'electronics' } },
        { path: '/products/shoe/123', expectedHandler: 'detail', expectedParams: { category: 'shoe', id: '123' } },
        { path: '/products/clothes/123/extra', expectedHandler: null },
      ];

      testCases.forEach(({ path, expectedHandler, expectedParams }) => {
        const matchedRoute = compiledRoutes.find(route =>
          path.match(route.regex.regex)
        );

        if (expectedHandler === null) {
          expect(matchedRoute).toBeUndefined();
        } else {
          expect(matchedRoute?.handler).toBe(expectedHandler);

          if (matchedRoute) {
            const params = extractParams(matchedRoute.regex, path);
            expect(params).toEqual(expectedParams);
          }
        }
      });
    });
    it('should extract parameters correctly for complex path', () => {
      const result = pathToRegexp('/api/:version/users/:userId/posts/:postId/comments/:commentId');

      const testPath = '/api/v2/users/bob/posts/789/comments/456';
      const params = extractParams(result, testPath);

      expect(params).toEqual({
        version: 'v2',
        userId: 'bob',
        postId: '789',
        commentId: '456'
      });
    });
  });

  describe('Special character handling', () => {
    it('should handle special characters in parameter values', () => {
      const result = pathToRegexp('/search/:query');

      const testCases = [
        { path: '/search/hello-world', expected: 'hello-world' },
        { path: '/search/user@example.com', expected: 'user@example.com' },
        { path: '/search/price_$100', expected: 'price_$100' },
      ];

      testCases.forEach(({ path, expected }) => {
        const match = path.match(result.regex);
        expect(match?.[1]).toBe(expected);
      });
    });

    it('should not match paths with too many segments', () => {
      const result = pathToRegexp('/user/:id');

      expect('/user/123'.match(result.regex)).not.toBeNull();
      expect('/user/123/profile'.match(result.regex)).toBeNull();
      expect('/user/123/profile/extra'.match(result.regex)).toBeNull();
    });
  });

});


describe('parseRawHttpRequest', () => {
  describe('Base HTTP request parsing', () => {
    it('should parse a simple GET request', () => {
      const rawRequest =
        'GET /index.html HTTP/1.1\r\n' +
        'Host: example.com\r\n' +
        'User-Agent: TestAgent/1.0\r\n' +
        'Accept: text/html\r\n' +
        '\r\n';

      const result = parseRawHttpRequest(rawRequest);
      expect(result.method).toBe('GET');
      expect(result.path).toBe('/index.html');
      expect(result.headers).toEqual({
        'Host': 'example.com',
        'User-Agent': 'TestAgent/1.0',
        'Accept': 'text/html'
      });
      expect(result.query).toEqual({});
    });
    it('should parse a POST request with headers', () => {
      const rawRequest =
        'POST /api/users HTTP/1.1\r\n' +
        'Host: api.example.com\r\n' +
        'Content-Type: application/json\r\n' +
        'Content-Length: 128\r\n' +
        'Authorization: Bearer token123\r\n' +
        '\r\n' +
        '{"name":"John","age":30}';

      const result = parseRawHttpRequest(rawRequest);

      expect(result.method).toBe('POST');
      expect(result.path).toBe('/api/users');
      expect(result.headers).toEqual({
        'Host': 'api.example.com',
        'Content-Type': 'application/json',
        'Content-Length': '128',
        'Authorization': 'Bearer token123'
      });
    });
    it('should parse request with query string in path', () => {
      const rawRequest =
        'GET /search?q=test&page=2 HTTP/1.1\r\n' +
        'Host: example.com\r\n' +
        '\r\n';

      const result = parseRawHttpRequest(rawRequest);

      expect(result.method).toBe('GET');
      expect(result.path).toBe('/search?q=test&page=2');
      // Note: The current implementation does not parse query parameters into a query object
      expect(result.query).toEqual({});
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty request string', () => {
      const result = parseRawHttpRequest('');

      expect(result.method).toBe('GET');  // 默认值
      expect(result.path).toBe('/');      // 默认值
      expect(result.headers).toEqual({});
      expect(result.query).toEqual({});
    });

    it('should handle request with only method and path', () => {
      const result = parseRawHttpRequest('GET /');

      expect(result.method).toBe('GET');
      expect(result.path).toBe('/');
      expect(result.headers).toEqual({});
    });

    it('should handle malformed first line', () => {
      const result = parseRawHttpRequest('INVALID_LINE\r\nHeader: Value\r\n');

      expect(result.method).toBe('INVALID_LINE');
      expect(result.path).toBe('/');  // 因为分割后第二个元素不存在
      expect(result.headers).toEqual({ 'Header': 'Value' });
    });

    it('should handle headers with extra spaces', () => {
      const rawRequest =
        'GET /test HTTP/1.1\r\n' +
        'Header1:   Value1  \r\n' +    // 前后有空格
        'Header2:Value2\r\n' +          // 冒号后没有空格
        'Header3 : Value3\r\n' +        // 冒号前有空格
        '\r\n';

      const result = parseRawHttpRequest(rawRequest);

      expect(result.headers).toEqual({
        'Header1': '  Value1  ',
        'Header3 ': 'Value3'
      });
    });

    it('should ignore empty header lines', () => {
      const rawRequest =
        'GET /test HTTP/1.1\r\n' +
        '\r\n' +                        // 空行（会被split处理掉）
        'Header1: Value1\r\n' +
        '\r\n' +                        // 有效的空行，但会被reduce跳过
        'Header2: Value2\r\n' +
        '\r\n';

      const result = parseRawHttpRequest(rawRequest);

      expect(result.headers).toEqual({
        'Header1': 'Value1',
        'Header2': 'Value2'
      });
    });

    it('should handle Windows line endings', () => {
      const rawRequest =
        'GET /test HTTP/1.1\r\n' +
        'Host: example.com\r\n' +
        '\r\n';

      // 测试函数已经处理了\r\n，所以这个应该正常
      const result = parseRawHttpRequest(rawRequest);
      expect(result.headers['Host']).toBe('example.com');
    });

    it('should handle Unix line endings', () => {
      const rawRequest =
        'GET /test HTTP/1.1\n' +     // 只有\n，没有\r
        'Host: example.com\n' +
        '\n';

      // 由于函数使用\r\n分割，Unix换行会导致整个请求在一行
      const result = parseRawHttpRequest(rawRequest);

      // 期望行为：第一行包含整个请求
      expect(result.method).toBe('GET');
      expect(result.path).toBe('/test');
      expect(result.headers).toEqual({});  // 因为没有\r\n，headers不会被正确解析
    });

    it('should preserve original case of headers', () => {
      const rawRequest =
        'GET /test HTTP/1.1\r\n' +
        'X-Custom-Header: SomeValue\r\n' +
        'x-lowercase-header: AnotherValue\r\n' +
        '\r\n';

      const result = parseRawHttpRequest(rawRequest);

      expect(result.headers['X-Custom-Header']).toBe('SomeValue');
      expect(result.headers['x-lowercase-header']).toBe('AnotherValue');
    });
  });

  describe('Request body handling', () => {
    it('should ignore request body in parsing', () => {
      const rawRequest =
        'POST /api/data HTTP/1.1\r\n' +
        'Content-Type: application/json\r\n' +
        'Content-Length: 26\r\n' +
        '\r\n' +
        '{"message": "Hello World"}';

      const result = parseRawHttpRequest(rawRequest);

      // 函数只解析到空行，body被忽略
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['Content-Length']).toBe('26');
      // body不会被包含在解析结果中
    });
  });

});

