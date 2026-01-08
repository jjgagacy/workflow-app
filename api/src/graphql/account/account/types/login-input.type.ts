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
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'auth.INVALID_EMAIL' }
  )
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
  email: string;

  @Field()
  language: string;
}

@InputType('EmailCodeLoginSendEmail')
export class EmailCodeLoginSendEmail {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'auth.INVALID_EMAIL' }
  )
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
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    { message: 'auth.INVALID_EMAIL' }
  )
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;
}
