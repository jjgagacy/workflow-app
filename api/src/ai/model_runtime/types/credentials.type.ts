import { PROVIDERS } from "../enums/provider.enum";

export interface BaseCredentials {
  [key: string]: any;
}

export interface ApiKeyCredentials {
  apiKey: string;
  baseUrl?: string;
  [key: string]: any;
}

export interface ModelCredentials extends BaseCredentials {
  baseModelName?: string;
  model?: string;
  [key: string]: any;
}


// Azure OpenAI
export interface AzureOpenAICredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.AZURE_OPENAI;
  endpoint?: string;
  deploymentName?: string;
  apiVersion?: string;
}

// OpenAI 
export interface OpenAICredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.OPENAI;
  organizationId?: string;
}

// Anthropic
export interface AnthropicCredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.ANTHROPIC;
}

// MiniMax
export interface MiniMaxCredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.MINIMAX;
  groupId?: string;
}

// Spark
export interface SparkCredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.SPARK;
  appId: string;
}
// Zhipu
export interface ZhipuCredentials extends ApiKeyCredentials {
  provider: typeof PROVIDERS.ZHIPUAI;
}

export type Credentials =
  | ModelCredentials
  | ApiKeyCredentials
  | BaseCredentials
  | AzureOpenAICredentials
  | OpenAICredentials
  | AnthropicCredentials
  | MiniMaxCredentials
  | SparkCredentials
  | ZhipuCredentials;

