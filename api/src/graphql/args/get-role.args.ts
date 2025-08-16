import { ArgsType, Field, Int } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/graphql/args/pagination.args';

@ArgsType()
export class GetRoleArgs extends PaginationArgs {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  parent?: string;

  @Field((type) => Int, { nullable: true })
  status?: number;

  @Field((type) => Boolean, { nullable: true })
  hasMenus?: boolean;

  @Field((type) => Boolean, { nullable: true })
  hasRolePerms?: boolean;
}
