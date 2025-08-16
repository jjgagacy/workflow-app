import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('PermInput')
export class PermInput {
  @Field()
  module: string;

  @Field()
  key: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => Int, { nullable: true })
  restrictLevel?: number;
}
