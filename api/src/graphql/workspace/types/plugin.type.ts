import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';

@ObjectType('PluginInstallResponse')
export class PluginInstallResponse {
  @Field()
  allInstalled!: boolean;
}

@ObjectType('PluginInstallationResponse')
export class PluginInstallationResponse {
  @Field()
  id!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field()
  name!: string;

  @Field()
  pluginId!: string;

  @Field()
  tenantId!: string;

  @Field(() => GraphQLJSON)
  meta!: Record<string, any>;

  @Field()
  version!: string;
}