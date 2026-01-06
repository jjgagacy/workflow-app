import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ModuleResponse')
export class ModuleResponse {
  @Field((returns) => Int)
  id: number;
}
