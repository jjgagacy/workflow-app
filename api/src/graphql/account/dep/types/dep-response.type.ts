import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('DepResponse')
export class DepResponse {
  @Field((returns) => Int, { nullable: true })
  id?: number;
}
