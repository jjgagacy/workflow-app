import { ArgsType, Field } from "@nestjs/graphql";
import { RoleSetPermMenu } from "../types/role-set-perm-menu.type";

@ArgsType()
export class RoleSetPermInput {
    @Field()
    key: string;

    @Field((type) => [RoleSetPermMenu])
    menus: RoleSetPermMenu[];
}