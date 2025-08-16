import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from './role.type';
import { PageInfo } from 'src/common/graphql/types/page-info.type';

@ObjectType('RoleList')
export class RoleList {
  @Field((type) => [Role])
  data: Role[];

  @Field((type) => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}
