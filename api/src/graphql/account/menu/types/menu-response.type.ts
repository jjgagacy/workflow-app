import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('MenuResponse')
export class MenuResponse {
  @Field((returns) => Int)
  id: number;
}
