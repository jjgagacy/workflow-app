import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field((type) => Int, { nullable: true })
  page?: number;

  @Field((type) => Int, { nullable: true })
  limit?: number;
}
