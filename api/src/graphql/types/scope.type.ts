import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Scope')
export class Scope {
  @Field()
  key: string;

  @Field()
  name: string;
}
