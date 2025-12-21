import { ModelType } from "@/core/entities/enums/model.enum";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { Provider } from "@/core/entities/plugin/provider";

export abstract class ModelProvider {
  constructor(
    public providerSchema: Provider,
    public modelTypeMap: Map<ModelType, AIModel>,
  ) { }

  abstract validateProviderCredentials(credentials: Record<string, any>): Promise<void>;
}
