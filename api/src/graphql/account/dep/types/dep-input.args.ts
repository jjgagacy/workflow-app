import { ArgsType, Field, InputType } from "@nestjs/graphql";

@InputType('DepInput')
export class DepInputArgs {
    @Field({ nullable: true })
    key?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    parent?: string;

    @Field({ nullable: true })
    remarks?: string;

    @Field({ nullable: true })
    managerId?: number;
}