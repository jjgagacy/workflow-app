import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType('RoleInput')
export class RoleInput {
  @Field()
  key: string;

  @Field()
  parent: string;

  @Field({ nullable: true })
  name: string;

  @Field((type) => Int, { nullable: true })
  status: number;
}
