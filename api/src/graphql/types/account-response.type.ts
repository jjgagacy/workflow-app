import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AccountResponse')
export class AccountResponse {
    @Field((returns) => Int)
    id: number;
}
