import { ArgsType, Field, InputType } from "@nestjs/graphql";

@InputType()
export class RoleInput {
    @Field({ nullable: true })
    id?: number;
    
    @Field({ nullable: true })
    key?: string;
    
    @Field({ nullable: true })
    parent?: string;

    @Field({ nullable: true })
    status?: number;

    @Field({ nullable: true })
    name?: string;
}