import { AIModel } from "./ai-model.class";
import { Provider, ProviderProps } from "./provider.class";

export class ModelProviderDeclaration extends Provider {
  models: AIModel[] = [];
  modleFiles: string[] = [];
  positionFiles: Record<string, string> = {};

  constructor(props: ProviderProps) {
    super(props);
  }
}