import { Provider } from "@/ai/model_runtime/classes/provider.class";

export const DEFAULT_PLUGIN_ID = 'monie';

export class ModelProvider {
  id: string;
  pluginId: string;
  tenantId: string;
  provider: string;
  pluginUniqueIdentifier: string;

  createdAt: Date;
  updatedAt: Date;

  declaration: Provider;
}

