import { MonieConfig } from "@/monie/monie.config";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { PluginRequestOptions } from "../interfaces/client.interface";
import { AxiosResponse } from "axios";
import { catchError, map, mergeMap, Observable, retry, throwError } from "rxjs";
import { Readable } from 'stream';
import FormData from "form-data";

@Injectable()
export class BasePluginClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly monieConfig: MonieConfig,
  ) { }

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
        delay: 1500,
        resetOnSuccess: true,
      }),
      catchError(error => {
        return throwError(() => new Error(`Request plugin api error: ${error.message}`));
      })
    );
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
  streamRequest(
    options: Omit<PluginRequestOptions, 'stream'>,
  ): Observable<string> {
    return this.request<Readable>({
      ...options,
      stream: true,
    }).pipe(
      map(response => response.data),
      mergeMap(stream => this.transformStreamToLines(stream as unknown as Readable)),
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
            if (dataLine) subscriber.next(dataLine);
          }
        }
      };

      const onEnd = () => {
        if (buffer.trim()) {
          const trimmedLine = buffer.trim();
          if (trimmedLine.startsWith('data:')) {
            const dataLine = trimmedLine.slice(5).trim();
            if (dataLine) subscriber.next(dataLine);
          }
        }
        subscriber.complete();
      }

      const onError = (error) => subscriber.error(error);

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

}
