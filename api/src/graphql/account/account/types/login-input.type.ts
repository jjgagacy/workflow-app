import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNotEmpty, Length, Matches } from 'class-validator';

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
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Length(1, 2, { message: 'validation.NOT_EMPTY' })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'validation.NOT_EMPTY' }
  )
  email: string;

  @Field()
  language: string;
}
