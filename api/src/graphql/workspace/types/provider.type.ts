import { Field, InputType, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';

@ObjectType('ProviderCredentialResponse')
export class ProviderCredentialResponse {
  @Field()
  providerName!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  credentials?: Record<string, any>;
}

@ObjectType('ModelCredentialResponse')
export class ModelCredentialResponse {
  @Field()
  providerName!: string;

  @Field(() => String, { nullable: false })
  model!: string;

  @Field(() => String, { nullable: false })
  modelType!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  credentials?: Record<string, any>;
}


@InputType('CredentialInput')
export class CredentialInput {
  @Field()
  providerName!: string;

  @Field(() => GraphQLJSON)
  credentials!: Record<string, any>;
}