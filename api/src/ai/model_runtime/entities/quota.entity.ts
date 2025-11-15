import { IsOptional } from "class-validator";
import { QuotaType, QuotaUnit } from "../enums/quota.enum";
import { RestrictModel } from "./configuration.entity";
import { ModelType } from "../enums/model-runtime.enum";
import { Credentials } from "../types/credentials.type";

export interface QuotaConfigurationProps {
  quotaType: QuotaType;
  quotaUnit: QuotaUnit;
  quotaLimit: number;
  quotaUsed: number;
  isValid: boolean;
  restrictModel?: RestrictModel[];
}

// Provider quota configuration
export class QuotaConfiguration {
  quotaType: QuotaType;
  quotaUnit: QuotaUnit;
  quotaLimit: number;
  quotaUsed: number;

  isValid: boolean;

  @IsOptional()
  restrictModel?: RestrictModel[];

  constructor(props: QuotaConfigurationProps) {
    this.quotaType = props.quotaType;
    this.quotaUnit = props.quotaUnit;
    this.quotaLimit = props.quotaLimit;
    this.quotaUsed = props.quotaUsed;
    this.restrictModel = props.restrictModel;
  }
}

// Provider system configuration
export class SystemConfiguration {
  enabled: boolean;

  @IsOptional()
  currentQuotaType?: QuotaType;

  quotaConfiguration: QuotaConfiguration[] = [];

  @IsOptional()
  credentials?: Credentials;

  constructor(
    enabled: boolean,
    quotaConfiguration: QuotaConfiguration[] = [],
    currentQuotaType?: QuotaType,
    credentials?: Credentials
  ) {
    this.enabled = enabled;
    this.quotaConfiguration = quotaConfiguration;
    this.currentQuotaType = currentQuotaType;
    this.credentials = credentials;
  }
}

// Provider custom model
export class CustomProviderModel {
  model: string;
  modelType: ModelType;

  credentials: Credentials;
}

// Provider custom configuration
export class CustomProviderConfiguration {
  @IsOptional()
  credentials?: Credentials;

  models: CustomProviderModel[] = [];
}
