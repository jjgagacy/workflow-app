import { Field, ObjectType } from '@nestjs/graphql';
import { Module } from './module.type';
import { PageInfo } from 'src/common/graphql/types/page-info.type';

@ObjectType('ModuleList')
export class ModuleList {
  @Field((type) => [Module])
  data: Module[];

  @Field((type) => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}
