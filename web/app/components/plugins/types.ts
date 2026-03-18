export type ProviderType = 'model' | 'tool' | 'endpoint';

export type Plugin = {
  providerType: ProviderType;
  author: string;
  name: string;
  icon: string;
  label: Record<string, string>;
  description?: Record<string, string>;
}

export type PluginInstallation = {
  id: string;
  name: string;
  pluginId: string;
  tenantId: string;
  version: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}