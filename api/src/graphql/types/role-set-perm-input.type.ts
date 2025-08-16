import { Field, InputType } from '@nestjs/graphql';
import { RoleSetPermMenu } from './role-set-perm-menu.type';

@InputType('RoleSetPermInput')
export class RoleSetPermInput {
  @Field()
  key: string;

  @Field((type) => [RoleSetPermMenu])
  menus: RoleSetPermMenu[];
}
