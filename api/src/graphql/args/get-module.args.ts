import { ArgsType, Field } from '@nestjs/graphql';
import { PaginationArgs } from '@/common/graphql/args/pagination.args';

@ArgsType()
export class GetModuleArgs extends PaginationArgs {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  name?: string;
}
