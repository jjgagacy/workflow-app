import { ModelFeature } from "../enums/model.enum";
import { PriceConfig } from "../pricing";
import { ProviderBase } from "./provider-base";

export abstract class AIModel extends ProviderBase {
  pricing?: PriceConfig;

  constructor() {
    super();
    this.validateModel();
  }

  private validateModel(): void {
    if (!this.features) {
      this.features = [ModelFeature.STRUCTURED_OUTPUT];
    } else {
      this.features.push(ModelFeature.STRUCTURED_OUTPUT);
    }
  }

  abstract validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
