import { IsOptional } from "class-validator";
import { QuotaType, QuotaUnit } from "../enums/quota.enum";
import { RestrictModel } from "./configuration.entity";
import { ModelType } from "../enums/model-runtime.enum";

// Provider quota configuration
export class QuotaConfigiration {
  quotaType: QuotaType;
  quotaUnit: QuotaUnit;
  quotaLimit: number;
  quotaUsed: number;

  isValid: boolean;

  @IsOptional()
  restrictModel?: RestrictModel[];
}

// Provider system configuration
export class SystemConfiguration {
  enabled: boolean;

  @IsOptional()
  currentQuotaType?: QuotaType;

  quotaConfiguration: QuotaConfigiration[] = [];

  @IsOptional()
  credentials?: Record<string, any>;
}

// Provider custom model
export class CustomProviderModel {
  model: string;
  modelType: ModelType;

  credentials: Record<string, any>;
}

// Provider custom configuration
export class CustomProviderConfiguration {
  @IsOptional()
  credentials?: Record<string, any>;

  models: CustomProviderModel[] = [];
}
