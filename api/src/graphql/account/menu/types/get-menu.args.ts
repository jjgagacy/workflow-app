import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class GetMenuArgs {
  @Field({ nullable: true })
  name?: string;

  @Field((returns) => Int, { nullable: true })
  status?: number;

  @Field({ nullable: true })
  parent?: string;

  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  modulePerm?: boolean;

  @Field({ nullable: true })
  scope?: boolean;

  @Field({ nullable: true })
  module?: boolean;
}
