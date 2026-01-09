import { EMAIL_REGEX } from '@/common/constants/regex.constants';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, Matches } from 'class-validator';

@InputType('ForgetPasswordInput')
export class ForgetPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;

  @Field({ nullable: true })
  language?: string;
}

@InputType('ForgetPasswordCheckInput')
export class ForgetPasswordCheckInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;

  @Field({ nullable: true })
  language?: string;
}

@ObjectType('ForgetPasswordCheckResponse')
export class ForgetPasswordCheckResponse {
  @Field()
  token: string;

  @Field()
  isValid: boolean;

  @Field()
  email: string;
}

@InputType('ForgetPasswordResetInput')
export class ForgetPasswordResetInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  newPassword: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  confirmPassword: string;
}

