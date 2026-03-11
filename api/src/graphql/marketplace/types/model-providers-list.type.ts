import { PageInfo } from "@/common/graphql/types/page-info.type";
import { I18nObjectType } from "@/graphql/model/model_provider/types/i18n-object.type";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('ModelProvider')
export class ModelProvider {
  @Field(() => String, { description: "Name of the provider" })
  provider!: string;

  @Field(() => String, { description: "Url of the provider icon" })
  icon!: string;

  @Field(() => I18nObjectType, { description: "Label of the provider in multiple languages" })
  label!: I18nObjectType;

  @Field(() => I18nObjectType, { description: "Description of the provider in multiple languages" })
  description!: I18nObjectType;
}

@ObjectType('ModelProvidersList')
export class ModelProvidersList {
  @Field(() => [ModelProvider], { description: "List of model providers" })
  data!: ModelProvider[];

  @Field(() => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}