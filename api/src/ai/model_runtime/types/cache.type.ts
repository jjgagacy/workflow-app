export enum CredentialsCacheType {
  PROVIDER = 'provider',
  MODEL = 'model',
}

export interface CredentialsCacheOptions {
  ttl?: number; // seconds
}
