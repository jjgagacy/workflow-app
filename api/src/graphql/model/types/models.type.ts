import { FetchFrom, ModelFeature, ModelPropertyKey } from '@/ai/model_runtime/enums/model-runtime.enum';
import { ModelStatus } from '@/ai/model_runtime/enums/model-status.enum';
import { I18nObject } from '@/graphql/model/model_provider/types/i18n-object.type';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(ModelStatus, {
  name: 'ModelStatus', // GraphQL 中的类型名称
  description: '模型状态', // 可选：类型描述
});

registerEnumType(ModelFeature, {
  name: 'ModelFeature', // GraphQL 中的类型名称
  description: '模型功能', // 可选：类型描述
});

registerEnumType(FetchFrom, {
  name: 'FetchFrom', // GraphQL 中的类型名称
  description: '模型来源', // 可选：类型描述
});

registerEnumType(ModelPropertyKey, {
  name: 'ModelPropertyKey', // GraphQL 中的类型名称
  description: '模型属性键', // 可选：类型描述
});

@ObjectType('ProviderModelResponse')
export class ProviderModelResponse {
  @Field(() => String, { nullable: false })
  model!: string;

  @Field(() => I18nObject, { nullable: false })
  label?: I18nObject;

  @Field(() => String, { nullable: false })
  modelType!: string;

  @Field(() => [ModelFeature], { nullable: true })
  features?: ModelFeature[];

  @Field(() => FetchFrom, { nullable: false })
  fetchFrom!: FetchFrom;

  @Field(() => GraphQLJSON, { nullable: true })
  modelProperties!: Record<ModelPropertyKey, any>;

  @Field(() => Boolean, { nullable: false })
  deprecated!: boolean;

  @Field(() => ModelStatus, { nullable: false })
  status!: ModelStatus;
}