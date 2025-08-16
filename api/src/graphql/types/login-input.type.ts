import { Field, InputType } from '@nestjs/graphql';

@InputType('LoginInput')
export class LoginInput {
  @Field()
  username: string;

  @Field()
  password: string;
}
