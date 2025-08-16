import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ModulePerm } from './module.perm.type';
import { Scope } from './scope.type';
import { Module } from './module.type';

@ObjectType('Menu')
export class Menu {
  @Field((types) => Int)
  id: number;
  @Field()
  key: string;
  @Field()
  name: string;
  @Field()
  parent: string;
  @Field((types) => Int)
  status: number;
  @Field((types) => Int)
  sort: number;
  @Field((types) => Module, { nullable: true })
  module?: Module;
  @Field((types) => [ModulePerm], { nullable: true })
  modulePerm?: ModulePerm[];
  @Field((types) => [Scope], { nullable: true })
  scope?: Scope[];
}
