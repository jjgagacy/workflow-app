import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('WorkspaceList')
export class WorkspaceList {
    @Field(() => String)
    id: string;

    @Field()
    name: string;

    @Field()
    plan: string;

    @Field()
    status: string;

    @Field(() => Date)
    created_at: Date;

    @Field()
    current: boolean;
}
