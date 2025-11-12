import { Provider } from "@/ai/model_runtime/classes/provider.class";

export const DEFAULT_PLUGIN_ID = 'monie';

export class ModelProviderDto {
  id: string;

  tenantId: string;

  provider: string;

  createdAt: Date;

  pluginUniqueIdentifier: string;

  pluginId: string;

  updatedAt: Date;

  declaration: Provider;
}
