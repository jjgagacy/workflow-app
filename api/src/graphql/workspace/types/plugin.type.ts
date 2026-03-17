import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('PluginInstallResponse')
export class PluginInstallResponse {
  @Field()
  allInstalled!: boolean;
}
