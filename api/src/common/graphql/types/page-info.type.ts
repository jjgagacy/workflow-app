import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PageInfo')
export class PageInfo {
  @Field((type) => Int)
  page: number;

  @Field((type) => Int)
  pageSize: number;

  @Field((type) => Int)
  total: number;
}
