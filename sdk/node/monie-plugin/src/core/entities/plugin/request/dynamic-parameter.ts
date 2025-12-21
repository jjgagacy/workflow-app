export class DynamicParameterFetchParameterOptionsRequest {
  provider: string;
  providerAction: string;
  credentials: Record<string, any>;
  userId?: string;
  parameter: string;

  constructor(data: Partial<DynamicParameterFetchParameterOptionsRequest>) {
    Object.assign(this, data);
    this.provider = data.provider || '';
    this.providerAction = data.providerAction || '';
    this.credentials = data.credentials || {};
    this.parameter = data.parameter || '';
  }
}

