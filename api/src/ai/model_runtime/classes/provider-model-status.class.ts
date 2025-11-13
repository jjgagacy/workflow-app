import { IsOptional } from "class-validator";
import { ModelStatus } from "../enums/model-status.enum";
import { ProviderModel } from "./provider-model.class";
import { SimpleProvider } from "./provider.class";

export class ProviderModelStatus extends ProviderModel {
  status: ModelStatus;

  @IsOptional()
  loadBalancingEnabled: boolean = false;

  raiseForStatus(): void {
    if (this.status == ModelStatus.ACTIVE) {
      return;
    }

    const errorMessages: Record<ModelStatus, string> = {
      [ModelStatus.NO_CONFIGURE]: 'Model is not configured',
      [ModelStatus.QUOTA_EXCEEDED]: 'Model quota has been exceeded',
      [ModelStatus.NO_PERMISSION]: 'No Permission to use this model',
      [ModelStatus.DISABLED]: 'Model is disabled',
      [ModelStatus.ACTIVE]: "", // This case is handled above
    };

    if (this.status in errorMessages) {
      throw new Error(errorMessages[this.status]);
    }
  }
}

export class ModelWithProvider extends ProviderModelStatus {
  provider: SimpleProvider;
}
