import { FetchFrom, ModelFeature, ModelPropertyKey } from '@/ai/model_runtime/enums/model-runtime.enum';
import { ModelStatus } from '@/ai/model_runtime/enums/model-status.enum';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(ModelStatus, {
  name: 'ModelStatus', // GraphQL 中的类型名称
  description: '模型状态', // 可选：类型描述
  valuesMap: {
    ACTIVE: {
      description: '模型处于活动状态', // 可选：为每个值添加描述
    },
    NO_CONFIGURE: {
      description: '模型未配置', // 可选：为每个值添加描述
    },
    QUOTA_EXCEEDED: {
      description: '模型配额已超出', // 可选：为每个值添加描述
    },
    NO_PERMISSION: {
      description: '没有权限使用该模型', // 可选：为每个值添加描述
    },
    DISABLED: {
      description: '模型已禁用', // 可选：为每个值添加描述
    },
  },
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

@ObjectType('ProviderModel')
export class ProviderModel {
  @Field(() => String, { nullable: false })
  model!: string;

  @Field(() => String, { nullable: false })
  label?: string;

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