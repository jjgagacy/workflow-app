import { IsOptional } from "class-validator";
import { ModelStatus } from "../enums/model-status.enum";
import { ProviderModel, ProviderModelProps } from "./provider-model.class";
import { SimpleProvider } from "./provider.class";

export interface ProviderModelStatusProps extends ProviderModelProps {
  status: ModelStatus;
  loadBalancingEnabled?: boolean;
}

export class ProviderModelStatus extends ProviderModel {
  status: ModelStatus;

  @IsOptional()
  loadBalancingEnabled: boolean = false;

  constructor(props: ProviderModelStatusProps) {
    super(props);
    this.status = props.status;
    this.loadBalancingEnabled = props.loadBalancingEnabled ?? false;
  }

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

  constructor(props: ProviderModelStatusProps & { provider: SimpleProvider }) {
    super(props);
    this.provider = props.provider;
  }
}
