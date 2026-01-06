import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('DepInput')
export class DepInput {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  remarks?: string;

  @Field({ nullable: true })
  parent?: string;

  @Field({ nullable: true })
  manager?: string;
}
