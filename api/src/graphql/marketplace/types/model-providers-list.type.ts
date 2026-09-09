import { PageInfo } from "@/common/graphql/types/page-info.type";
import { I18nObject } from "@/graphql/model/model_provider/types/i18n-object.type";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('MarketplaceModelProviderResponse')
export class MarketplaceModelProviderResponse {
  @Field(() => String, { description: "Type of the provider" })
  providerType!: string;

  @Field(() => String, { description: "Name of the author" })
  author!: string;

  @Field(() => String, { description: "Name of the model" })
  name!: string;

  @Field(() => String, { description: "Url of the provider icon" })
  icon!: string;

  @Field(() => I18nObject, { description: "Label of the provider in multiple languages" })
  label!: I18nObject;

  @Field(() => I18nObject, { nullable: true, description: "Description of the provider in multiple languages" })
  description?: I18nObject;
}

@ObjectType('ModelProvidersListResponse')
export class MarketplaceModelProvidersListResponse {
  @Field(() => [MarketplaceModelProviderResponse], { description: "List of model providers" })
  data!: MarketplaceModelProviderResponse[];

  @Field(() => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}