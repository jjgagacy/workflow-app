import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType('RoleSetPermMenu')
export class RoleSetPermMenu {
  @Field()
  key: string;

  @Field((type) => [String], { nullable: true })
  scope: string[];

  @Field((type) => [String], { nullable: true })
  perms: string[];
}
