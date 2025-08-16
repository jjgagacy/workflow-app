import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Perm')
export class Perm {
  @Field()
  key: string;

  @Field()
  name: string;

  @Field((type) => Int, { nullable: true })
  restrictLevel?: number;
}
