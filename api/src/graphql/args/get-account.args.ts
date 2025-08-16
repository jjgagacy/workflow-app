import { ArgsType, Field, Int } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/graphql/args/pagination.args';

@ArgsType()
export class GetAccountArgs extends PaginationArgs {
  @Field((returns) => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  realName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field((returns) => Int,{ nullable: true })
  roleId?: number;
}
