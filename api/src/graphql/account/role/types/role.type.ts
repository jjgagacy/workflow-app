import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RolePerms } from './role-perms.type';

@ObjectType('Role')
export class Role {
  @Field((type) => Int)
  id: number;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field()
  parent: string;

  @Field((type) => Int)
  status: number;

  @Field()
  created_at: string;

  @Field()
  created_by: string;

  @Field((type) => [RolePerms], { nullable: true })
  rolePerms?: RolePerms[];
}
