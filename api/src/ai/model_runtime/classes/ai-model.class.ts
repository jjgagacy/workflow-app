import { IsOptional } from "class-validator";
import { ProviderModel, ProviderModelProps } from "./provider-model.class";
import { PriceConfig } from "./model-runtime.class";
import { ModelFeature } from "../enums/model-runtime.enum";

export class AIModel extends ProviderModel {
  @IsOptional()
  pricing?: PriceConfig;

  constructor(props: ProviderModelProps & { pricing?: PriceConfig }) {
    super(props);
    this.pricing = props.pricing;
    this.validateModel();
  }

  private validateModel(): void {
    if (!this.features) {
      this.features = [ModelFeature.structured_output];
    } else {
      this.features.push(ModelFeature.structured_output);
    }
  }
}
