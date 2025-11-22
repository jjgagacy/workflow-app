import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType('RestrictModel')
export class RestrictModel {
  @Field()
  modelName: string;
  @Field()
  modelType: string;
  @Field()
  baseModelName: string;
}

@ObjectType('QuotaInfo')
export class QuotaInfo {
  @Field()
  quotaType: string;
  @Field()
  quotaUnit: string;
  @Field(() => Int)
  quotaLimit: number;
  @Field(() => Int)
  quotaUsed: number;
  @Field(() => Boolean)
  isValid: boolean;
  @Field(() => [RestrictModel])
  restrictModels: RestrictModel[];
}

@ObjectType('CustomConfiguration')
export class CustomConfiguration {
  @Field()
  status: string;
}

@ObjectType('SystemConfiguration')
export class SystemConfiguration {
  @Field(() => Boolean)
  enabled: boolean;
  @Field()
  currentQuotaType: string;
  @Field(() => [QuotaInfo])
  quotaList: [QuotaInfo]
}

@ObjectType('ProviderInfo')
export class ProviderInfo {
  @Field()
  tenantId: string;
  @Field()
  providerName: string;
  @Field()
  label: string;
  @Field()
  description: string;
  @Field()
  icon: string;
  @Field(() => [String!]!)
  supportedModelTypes: string[];
  @Field()
  preferredProviderType: string;
  @Field(() => CustomConfiguration)
  customConfiguration: CustomConfiguration;
  @Field(() => SystemConfiguration)
  systemConfiguration: SystemConfiguration;
}

@ObjectType('ProviderList')
export class ProviderList {
  @Field(() => [ProviderInfo])
  data: ProviderInfo[];
}


