import { MonieConfig } from "@/monie/monie.config";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { FileItem, PluginRequestOptions } from "../../ai/plugin/interfaces/client.interface";
import { AxiosResponse } from "axios";
import { catchError, EMPTY, map, mergeMap, Observable, of, retry, takeUntil, tap, throwError, timer } from "rxjs";
import { Readable } from 'stream';
import FormData from "form-data";
import { GlobalLogger, LogContext } from "@/logger/logger.service";
import { PluginDaemonBasicResponse } from "@/ai/plugin/entities/plugin-daemon";
import { handlePluginError, PluginDaemonError, PluginInvokeError } from "@/ai/plugin/entities/plugin-error";
import { v4 as uuidv4 } from 'uuid';
import { formatBytes } from "@/common/utils/number";
import { deepSnakeToCamel } from "@/common/utils/string";
import { EXCLUDED_LANG_KEYS } from "@/i18n-global/langmap";
import { safeStringify } from "@/common/utils/json";

@Injectable()
export class BasePluginClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly monieConfig: MonieConfig,
    private readonly logger: GlobalLogger
  ) { }

  private generateRequestId(): string {
    return `${uuidv4()}_${Date.now()}`;
  }

  private request<T = any>(
    options: PluginRequestOptions
  ): Observable<AxiosResponse<T>> {
    const { method, path, headers = {}, data, params, files, stream } = options;

    const url = new URL(path, this.monieConfig.pluginBaseUrl()).toString();

    let requestHeaders = {
      'X-API-Key': this.monieConfig.pluginApiKey(),
      'Accept-Encoding': 'gzip, deflate, br',
      ...headers,
    };

    let requestData = data;
    if (requestHeaders['Content-Type'] === 'application/json') {
      requestData = JSON.stringify(requestData);
    }

    if (files && Object.keys(files).length > 0) {
      const formData = new FormData();
      // Add regular data fields
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value as any);
      }
      // Add files
      for (const [fieldName, fileItem] of Object.entries(files)) {
        if (fileItem.options) {
          formData.append(fieldName, fileItem.value, fileItem.options);
        } else {
          formData.append(fieldName, fileItem.value);
        }
      }

      requestData = formData;
      requestHeaders = {
        ...requestHeaders,
        ...formData.getHeaders(),
      }
    }

    return this.httpService.request<T>({
      method,
      url,
      headers: requestHeaders,
      data: requestData,
      params,
      responseType: stream ? 'stream' : 'json',
      ...(files && { timeout: 30000 }), // 30 seconds for file uploads
    }).pipe(
      retry({
        count: 3,
        resetOnSuccess: true,
        delay: (error, retryCount) => {
          // Only retry on network errors or 5xx server errors
          if (error.code === 'ECONNREFUSED' ||
            error.code === 'ECONNRESET' ||
            error.response?.status >= 500) {
            return timer(1500 * retryCount);
          }
          // Don't retry for client errors (4xx)
          return throwError(() => error);
        },
      }),
      catchError(error => {
        return throwError(() => new Error(`Request plugin api error: ${error.message}, headers: ${JSON.stringify(safeStringify(error.config?.headers))} data: ${JSON.stringify(safeStringify(error.config?.data))}`));
      })
    );
  }

  private shouldRetry(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT') {
      return true;
    }

    // Server errors (5xx)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }

    // Rate limiting (429)
    if (error.response?.status === 429) {
      return true;
    }

    // Don't retry for client errors (4xx except 429)
    return false;
  }

  jsonRequest<T = any>(
    options: Omit<PluginRequestOptions, 'stream'>,
  ): Observable<T> {
    return this.request<T>({
      ...options,
      stream: false
    }).pipe(map(response => response.data));
  }

  /**
   * Make a stream request to the plugin daemon api
   **/
  streamRequest<T>(
    options: Omit<PluginRequestOptions, 'stream'>,
  ): Observable<T> {
    const { headers = {}, method, path } = options || {};

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    options.headers = requestHeaders;

    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const baseContext: LogContext = {
      requestId,
      method,
      path,
      timestamp: new Date().toISOString(),
      headers: this.sanitizeHeaders(requestHeaders),
      data: options?.data,
      params: options?.params,
      files: options?.files,
    }
    this.logger.log(`[${requestId}] request plugin details`, baseContext);

    let hasReceivedData = false;

    return this.request<Readable>({
      ...options,
      stream: true,
    }).pipe(
      map(response => response.data),
      mergeMap(stream => this.transformStreamToLines(stream as unknown as Readable)),
      mergeMap(line => {
        hasReceivedData = true;
        const duration = Date.now() - startTime;
        const pluginResponse = this.validatePluginResponse<T>(line);

        this.logger.log(`[${requestId}] receive stream line`, {
          ...baseContext,
          duration: `${duration}ms`,
          responseData: pluginResponse.data,
          hasData: !!pluginResponse.data,
        });

        if (pluginResponse.data === null) {
          const frame = new Error().stack?.split('\n')[2]; // Get caller info
          throw new Error(`got empty data from plugin daemon: ${frame || 'unknown'}`);
        }

        return of(pluginResponse.data);
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        this.logger.error(`[${requestId}] request plugin api error`, {
          ...baseContext,
          duration: `${duration}ms`,
          threshold: '5s',
          error: error
        });
        if (hasReceivedData && error.code === 'ECONNRESET') {
          console.log(`[${requestId}] Connection reset after receiving data, treating as success`);
          return EMPTY;
        }
        return throwError(() => new Error(`Request plugin api error: ${error.message}, headers: ${JSON.stringify(safeStringify(error.config?.headers))} data: ${JSON.stringify(safeStringify(error.config?.data))}`));
      })
    );
  }

  streamRequestRaw(
    options: Omit<PluginRequestOptions, 'stream'>,
  ): Observable<Readable> {
    return this.request<Readable>({
      ...options,
      stream: true,
    }).pipe(
      map(response => response.data),
    );
  }

  private transformStreamToLines(stream: Readable): Observable<string> {
    return new Observable<string>(subscriber => {
      let buffer = "";
      let hasData = false; // 标记是否收到过数据

      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf-8');

        // split lines
        const lines = buffer.split('\n');
        // reserve last not complete line
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data:')) {
            const dataLine = trimmedLine.slice(5).trim();
            if (dataLine) {
              subscriber.next(dataLine);
              hasData = true;
            }
          } else {
            subscriber.next(trimmedLine);
            hasData = true;
          }
        }
      };

      const onEnd = () => {
        if (buffer.trim()) {
          const trimmedLine = buffer.trim();
          if (trimmedLine.startsWith('data:')) {
            const dataLine = trimmedLine.slice(5).trim();
            if (dataLine) subscriber.next(dataLine);
          } else {
            subscriber.next(trimmedLine);
          }
        }
        subscriber.complete();
      }

      const onError = (error: any) => {
        if (hasData && error.code === 'ECONNRESET') {
          // 如果已经收到过数据，且是连接重置错误，视为流正常结束
          subscriber.complete();
        } else {
          subscriber.error(error);
        }
      }

      stream.on('data', onData);
      stream.on('end', onEnd);
      stream.on('error', onError);

      return () => {
        stream.off('data', onData);
        stream.off('end', onEnd);
        stream.off('error', onError);
        if (!stream.destroyed) {
          stream.destroy();
        }
      };
    });
  }

  requestWithPluginDaemonResponse<T = any>(
    method: string,
    path: string,
    options?: {
      headers?: Record<string, string>;
      data?: Record<string, any> | FormData | null;
      params?: Record<string, any>;
      transformer?: (data: any) => any;
      files?: Record<string, FileItem>;
    }
  ): Observable<T> {
    const { headers = {}, data, params, transformer, files = {} } = options || {};

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const baseContext: LogContext = {
      requestId,
      method,
      path,
      timestamp: new Date().toISOString(),
      headers: this.sanitizeHeaders(headers),
      data: options?.data,
      params: options?.params,
      files: options?.files,
    }
    this.logger.log(`[${requestId}] request plugin details`, baseContext);

    return this.request<T>({
      method,
      path,
      headers: requestHeaders,
      data,
      params,
      files,
    }).pipe(
      map(response => {
        const duration = Date.now() - startTime;
        const responseData = response.data;

        this.logger.log(`[${requestId}] get plugin response`, {
          ...baseContext,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          responseSize: this.getSize(responseData),
        });

        const transformedData = transformer ? transformer(responseData) : responseData;
        if (!isValidPluginDaemonResponse(transformedData)) {
          this.logger.error(`[${requestId}] format error`, {
            ...baseContext,
            responseData,
          });
          throw new Error('Invalid plugin daemon response data format')
        }
        const pluginResponse = transformedData as PluginDaemonBasicResponse<T>;
        if (pluginResponse.code != 0) {
          this.logger.warn(`[${requestId}] response error`, {
            ...baseContext,
            code: pluginResponse.code,
            message: pluginResponse.message,
            duration: `${duration}ms`,
          });
          handlePluginError(pluginResponse);
        }
        if (pluginResponse.data === null || pluginResponse.data === undefined) {
          this.logger.error(`[${requestId}] returns empty data`, {
            ...baseContext,
            code: pluginResponse.code,
            duration: `${duration}ms`
          });
          throw new Error('Plugin daemon returned empty data');
        }

        this.logger.log(`[${requestId}] request success`, {
          ...baseContext,
          code: pluginResponse.code,
          responseData: pluginResponse.data,
          hasData: true,
          duration: `${duration}ms`
        });

        if (duration > 5000) {
          this.logger.warn(`[${requestId}] request time too long`, {
            ...baseContext,
            duration: `${duration}ms`,
            threshold: '5s'
          });
        }

        return deepSnakeToCamel(pluginResponse.data, EXCLUDED_LANG_KEYS); // 兼容后端返回的 snake_case 数据格式
      }),
      catchError(error => {
        if (error instanceof PluginDaemonError) {
          throw error;
        }
        // other errors
        console.error('Request failed:', error);
        throw error;
      }),
    );
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'token'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private getSize(data: any): string {
    try {
      const str = JSON.stringify(data);
      const bytes = new Blob([str]).size;
      return formatBytes(bytes);
    } catch {
      return 'unknown';
    }
  }

  private parseLine<T>(line: string): Observable<T> {
    try {
      const pluginResponse = this.validatePluginResponse<T>(line);

      if (pluginResponse.code !== 0) {
        throw new Error(`plugin daemon: ${pluginResponse.message}, code: ${pluginResponse.code}`);
      }

      if (pluginResponse.data === null) {
        const frame = new Error().stack?.split('\n')[2]; // Get caller info
        throw new Error(`got empty data from plugin daemon: ${frame || 'unknown'}`);
      }

      return of(pluginResponse.data);
    } catch (error: any) {
      return throwError(() => new PluginInvokeError(`Invalid plugin response: ${error.message}`));
    }
  }

  private validatePluginResponse<T>(line: string): PluginDaemonBasicResponse<T> {
    try {
      const pluginResponse = JSON.parse(line);
      if (!isValidPluginDaemonResponse(pluginResponse)) {
        throw new Error('Invalid plugin daemon response data format')
      }
      if (pluginResponse.code != 0) {
        handlePluginError(pluginResponse);
      }
      if (pluginResponse.data === null || pluginResponse.data === undefined) {
        throw new Error('Plugin daemon returned empty data');
      }
      return new PluginDaemonBasicResponse<T>(pluginResponse.code, pluginResponse.message, pluginResponse.data ?? null);
    } catch (error: any) {
      if (error instanceof PluginDaemonError) {
        throw error;
      }
      console.error('Request failed:', error);
      throw error;
    }
  }
}

export function isValidPluginDaemonResponse(obj: any): boolean {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.code === 'number' &&
    typeof obj.message === 'string' &&
    'data' in obj;
}
