import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType('CreateAppInput')
export class CreateAppInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  mode!: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  iconType?: string;
}

@InputType('UpdateAppInput')
export class UpdateAppInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  mode?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  iconType?: string;
}

@ObjectType('CreateAppResponse')
export class CreateAppResponse {
  @Field(() => String)
  id!: string;
}