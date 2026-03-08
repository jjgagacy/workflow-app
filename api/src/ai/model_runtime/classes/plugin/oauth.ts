export enum CredentialType {
  API_KEY = 'api_key',
  OAUTH = 'oauth2',
  NONE = 'none',
}

export class OauthSchema {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  [key: string]: any;

  constructor(data: Partial<OauthSchema> = {}) {
    this.authUrl = data.auth_url || '';
    this.tokenUrl = data.token_url || '';
    this.clientId = data.client_id || '';
    this.clientSecret = data.client_secret || '';
    this.scope = data.scope || '';
    Object.assign(this, data);
  }
}

