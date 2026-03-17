
export type Plugin = {
  providerType: 'model' | 'tool' | 'endpiont',
  provider: string;
  icon: string;
  label: Record<string, string>;
  description?: Record<string, string>;
}