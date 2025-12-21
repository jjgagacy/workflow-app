export class EndpointInvokeRequest {
  rawHttpRequest: string;
  settings?: Record<string, any>;

  constructor(data: Partial<EndpointInvokeRequest>) {
    Object.assign(this, data);
    this.rawHttpRequest = data.rawHttpRequest || '';
  }
}
