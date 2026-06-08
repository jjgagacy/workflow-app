import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('AppInfo')
export class AppInfo {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: false })
  mode!: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => String, { nullable: true })
  iconType?: string;

  @Field(() => Boolean, { nullable: false })
  enableSite!: boolean;

  @Field(() => Boolean, { nullable: false })
  enableApi!: boolean;

  @Field(() => Boolean, { nullable: false })
  isPublic!: boolean;

  @Field(() => String, { nullable: false })
  tenantId!: string;

  @Field(() => String, { nullable: true })
  workflowId?: string;

  @Field(() => String, { nullable: false })
  accountId!: string;

  @Field(() => String, { nullable: false })
  createdAt!: string;

  @Field(() => String, { nullable: false })
  createdBy!: string;

  @Field(() => String, { nullable: true })
  updatedAt?: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;
}