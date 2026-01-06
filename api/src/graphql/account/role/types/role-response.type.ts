import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('RoleResponse')
export class RoleResponse {
  @Field((returns) => Int)
  id: number;
}
