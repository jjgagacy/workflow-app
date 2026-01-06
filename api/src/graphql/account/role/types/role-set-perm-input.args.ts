import { ArgsType, Field } from "@nestjs/graphql";
import { RoleSetPermMenu } from "./role-set-perm-menu.type";

@ArgsType()
export class RoleSetPermInput {
    @Field()
    key: string;

    @Field((type) => [RoleSetPermMenu])
    menus: RoleSetPermMenu[];
}