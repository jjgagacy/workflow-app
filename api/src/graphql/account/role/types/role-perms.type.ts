import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RolePerms')
export class RolePerms {
  // menu key
  @Field()
  key: string;

  @Field((type) => [String])
  scope: string[];

  @Field((type) => [String])
  perms: string[];
}
