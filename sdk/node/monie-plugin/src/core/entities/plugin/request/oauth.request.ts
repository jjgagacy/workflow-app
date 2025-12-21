export class OAuthGetAuthorizationUrlRequest {
  provider: string;
  redirectUri: string;
  systemCredentials?: Record<string, any>;

  constructor(data: Partial<OAuthGetAuthorizationUrlRequest>) {
    Object.assign(this, data);
    this.provider = data.provider || '';
    this.redirectUri = data.redirectUri || '';
  }
}

export class OAuthGetCredentialsRequest {
  provider: string;
  redirectUri: string;
  systemCredentials?: Record<string, any>;
  rawHttpRequest: string;

  constructor(data: Partial<OAuthGetCredentialsRequest>) {
    Object.assign(this, data);
    this.provider = data.provider || '';
    this.redirectUri = data.redirectUri || '';
    this.rawHttpRequest = data.rawHttpRequest || '';
  }
}

export class OAuthRefreshCredentialsRequest {
  provider: string;
  redirectUri: string;
  systemCredentials?: Record<string, any>;
  credentials: Record<string, any>;

  constructor(data: Partial<OAuthRefreshCredentialsRequest>) {
    Object.assign(this, data);
    this.provider = data.provider || '';
    this.redirectUri = data.redirectUri || '';
    this.credentials = data.credentials || {};
  }
}


