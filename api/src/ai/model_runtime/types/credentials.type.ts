export interface BaseCredentials {
  [key: string]: any;
}

export interface ApiKeyCredentials {
  apiKey: string;
  baseUrl?: string;
  [key: string]: any;
}

export interface ModelCredentials extends BaseCredentials {
  model?: string;
  [key: string]: any;
}

export type Credentials =
  | ModelCredentials
  | ApiKeyCredentials
  | BaseCredentials;

