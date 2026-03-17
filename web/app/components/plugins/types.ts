export type ProviderType = 'model' | 'tool' | 'endpoint';

export type Plugin = {
  providerType: ProviderType;
  author: string;
  name: string;
  icon: string;
  label: Record<string, string>;
  description?: Record<string, string>;
}
