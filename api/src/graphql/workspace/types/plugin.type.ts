import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';

@ObjectType('PluginInstallResponse')
export class PluginInstallResponse {
  @Field(() => Boolean)
  allInstalled!: boolean;
  @Field({ defaultValue: '' })
  taskId!: string;
}

@ObjectType('PluginUninstallResponse')
export class PluginUninstallResponse {
  @Field()
  success!: boolean;
}

@ObjectType('PluginTaskInstallationStatusResponse')
export class PluginTaskInstallationStatusResponse {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  taskInstallations!: Record<string, any> | null;
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