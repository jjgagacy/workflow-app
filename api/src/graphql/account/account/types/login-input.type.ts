import { EMAIL_REGEX } from '@/common/constants/regex.constants';
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
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;
}

@InputType('ResetPasswordSendEmailInput')
export class ResetPasswordSendEmailInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  language: string;
}

@InputType('EmailCodeLoginSendEmail')
export class EmailCodeLoginSendEmail {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  language: string;
}


@InputType('EmailCodeSignUpInput')
export class EmailCodeSignUpInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  username: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;
}

@InputType('PasswordLoginInput')
export class PasswordLoginInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  password: string;

  @Field({ nullable: true })
  token?: string; // TODO: 可选的安全令牌，如验证码
}
