import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { I18nObject } from "./i18n-object.type";
import { FormType } from "@/ai/model_runtime/entities/form.entity";

@ObjectType('RestrictModel')
export class RestrictModel {
  @Field()
  modelName!: string;

  @Field()
  modelType!: string;

  @Field()
  baseModelName!: string;
}

@ObjectType('QuotaInfo')
export class QuotaInfo {
  @Field()
  quotaType!: string;

  @Field()
  quotaUnit!: string;

  @Field(() => Int)
  quotaLimit!: number;

  @Field(() => Int)
  quotaUsed!: number;

  @Field(() => Boolean)
  isValid!: boolean;

  @Field(() => [RestrictModel])
  restrictModels!: RestrictModel[];
}

@ObjectType('CustomConfiguration')
export class CustomConfiguration {
  @Field()
  status!: string;
}

@ObjectType('SystemConfiguration')
export class SystemConfiguration {
  @Field(() => Boolean)
  enabled!: boolean;

  @Field()
  currentQuotaType!: string;

  @Field(() => [QuotaInfo])
  quotaList!: [QuotaInfo]
}


registerEnumType(FormType, {
  name: 'FormType', // GraphQL 中的类型名称
  description: '表单字段类型', // 可选：类型描述
  valuesMap: {
    TEXT_INPUT: {
      description: '文本输入框', // 可选：为每个值添加描述
    },
    SECRET_INPUT: {
      description: '密码/密钥输入框',
    },
    SELECT: {
      description: '下拉选择框',
    },
    RADIO: {
      description: '单选框',
    },
    SWITCH: {
      description: '开关',
    },
  },
});

@ObjectType('CredentialFormSchema')
export class CredentialFormSchema {
  @Field(() => I18nObject)
  label!: I18nObject;

  @Field()
  variable!: string;

  @Field(() => FormType)
  type!: FormType;

  @Field(() => Boolean, { nullable: true })
  required?: boolean;

  @Field(() => String, { nullable: true })
  default?: string;

  @Field(() => [FormOption], { nullable: true })
  options?: FormOption[];

  @Field(() => I18nObject, { nullable: true })
  placeholder?: I18nObject;

  @Field(() => Int, { nullable: true })
  maxLength?: number;
}

@ObjectType('ProviderCredentialSchema')
export class ProviderCredentialSchema {
  @Field(() => [CredentialFormSchema], { nullable: true })
  credentialFormSchema?: CredentialFormSchema[];
}

@ObjectType('FieldModelSchema')
export class FieldModelSchema {
  @Field(() => I18nObject)
  label!: I18nObject;

  @Field(() => I18nObject, { nullable: true })
  placeholder?: I18nObject;
}

@ObjectType('ModelCredentialSchema')
export class ModelCredentialSchema {
  @Field(() => FieldModelSchema)
  model!: FieldModelSchema;

  @Field(() => [CredentialFormSchema])
  credentialFormSchema!: CredentialFormSchema[];
}

@ObjectType('FormOption')
export class FormOption {
  @Field(() => I18nObject)
  label!: I18nObject;

  @Field()
  value!: string;
}


@ObjectType('ModelProviderInfo')
export class ModelProviderInfo {
  @Field()
  tenantId!: string;

  @Field()
  providerName!: string;

  @Field(() => I18nObject)
  label!: I18nObject;

  @Field(() => I18nObject, { nullable: true })
  description?: I18nObject;

  @Field(() => I18nObject, { nullable: true })
  icon?: I18nObject;

  @Field(() => I18nObject, { nullable: true })
  iconDark?: I18nObject;

  @Field(() => [String!]!)
  supportedModelTypes!: string[];

  @Field()
  preferredProviderType!: string;

  @Field(() => CustomConfiguration)
  customConfiguration!: CustomConfiguration;

  @Field(() => SystemConfiguration)
  systemConfiguration!: SystemConfiguration;

  @Field(() => ProviderCredentialSchema, { nullable: true })
  providerCredentialSchema?: ProviderCredentialSchema;

  @Field(() => ModelCredentialSchema, { nullable: true })
  modelCredentialSchema?: ModelCredentialSchema;
}

@ObjectType('ModelProviderList')
export class ModelProviderList {
  @Field(() => [ModelProviderInfo])
  data!: ModelProviderInfo[];
}