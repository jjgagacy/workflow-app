import { HttpService } from "@nestjs/axios";
import { catchError, lastValueFrom, map, retry, throwError } from "rxjs";

export class BillingApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly secretKey: string,
  ) { }

  private async sendRequest(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any,
  ) {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.secretKey,
    };

    const url = `${this.baseUrl}${endpoint}`;
    return this.httpService.request({
      method,
      url,
      data: method != 'GET' ? data : undefined,
      params,
      headers,
    }).pipe(
      retry({
        count: 3,
        delay: 1500,
        resetOnSuccess: true,
      }),
      map(response => response.data),
      catchError(error => {
        return throwError(() => new Error(`Request billing api error: ${error.message}`));
      }),
    );
  }

  async getData<T>(endpoint: string, data?: any, params?: any): Promise<T> {
    const request$ = await this.sendRequest('GET', endpoint, data, params);
    const response = await lastValueFrom(request$);
    if (!response.success) {
      throw new Error(`Unable to retrieve billing data: ${response.message}`);
    }
    return response.data;
  }

  async postData<T>(endpoint: string, data?: any, params?: any): Promise<T> {
    const request$ = await this.sendRequest('POST', endpoint, data, params);
    const response = await lastValueFrom(request$);
    if (!response.success) {
      throw new Error(`Unable to post billing data: ${response.message}`);
    }
    return response.data;
  }

  async deleteData<T>(endpoint: string, data?: any, params?: any): Promise<T> {
    const request$ = await this.sendRequest('DELETE', endpoint, data, params);
    const response = await lastValueFrom(request$);
    if (!response.success) {
      throw new Error(`Unable to delete billing data: ${response.message}`);
    }
    return response.data;
  }
}
