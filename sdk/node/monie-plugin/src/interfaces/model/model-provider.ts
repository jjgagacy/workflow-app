import { ModelType } from "@/core/entities/enums/model.enum.js";
import { AIModel } from "@/core/entities/plugin/ai-model.js";
import { Provider } from "@/core/entities/plugin/provider.js";
import { ClassWithMarker } from "../marker.class.js";

export const MODEL_PROVIDER_SYMBOL = Symbol.for('plugin.modelprovider');

export abstract class ModelProvider {
  static [MODEL_PROVIDER_SYMBOL] = true;
  constructor(
    public providerSchema: Provider,
    public modelTypeMap: Map<ModelType, AIModel>,
  ) { }

  abstract validateProviderCredentials(credentials: Record<string, any>): Promise<void>;
}

export type ModelProviderClassType = ClassWithMarker<ModelProvider, typeof MODEL_PROVIDER_SYMBOL>;
export function isModelProviderClass(cls: any): cls is ModelProviderClassType {
  return Boolean(cls?.[MODEL_PROVIDER_SYMBOL]);
}
