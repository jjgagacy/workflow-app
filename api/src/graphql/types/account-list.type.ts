import { Field, ObjectType } from '@nestjs/graphql';
import { Account } from './account.type';
import { PageInfo } from 'src/common/graphql/types/page-info.type';

@ObjectType('AccountList')
export class AccountList {
  @Field((returns) => [Account])
  data: Account[];

  @Field((returns) => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}
