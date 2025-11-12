export enum ProviderType {
  CUSTOM = 'custom',
  SYSTEM = 'system',
}

export enum ConfigurateMethod {
  PREDEFINED_MODEL = 'predefined-model',
  CUSTOMIZABLE_MODEL = 'customizable-model',
}

export const PROVIDERS = {
  AZURE_OPENAI: 'azure_openai',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  MINIMAX: 'minimax',
  SPARK: 'spark',
  ZHIPUAI: 'zhipuai',
} as const;

export type PROVIDER_NAME = typeof PROVIDERS[keyof typeof PROVIDERS];


