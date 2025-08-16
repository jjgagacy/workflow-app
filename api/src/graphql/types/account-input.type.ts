import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('AccountInput')
export class AccountInput {
  @Field({ nullable: true })
  id: number;
  
  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  realName: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  mobile: string;

  @Field((type) => Int, { nullable: true })
  status: number;

  @Field((type) => [Int], { nullable: true })
  roles: number[];
}
