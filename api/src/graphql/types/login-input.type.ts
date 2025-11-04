import { Field, InputType } from '@nestjs/graphql';

@InputType('LoginInput')
export class LoginInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType('EmailCodeLoginInput')
export class EmailCodeLoginInput {
  @Field()
  email: string;

  @Field()
  code: string;

  @Field()
  token: string;
}