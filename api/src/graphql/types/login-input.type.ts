import { Field, InputType, PickType } from '@nestjs/graphql';

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

@InputType('ResetPasswordSendEmailInput')
export class ResetPasswordSendEmailInput {
  @Field()
  email: string;

  @Field()
  language: string;
}

@InputType('EmailCodeLoginSendEmail')
export class EmailCodeLoginSendEmail {
  @Field()
  email: string;

  @Field()
  language: string;
}
