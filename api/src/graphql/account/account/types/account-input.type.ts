import { USERNAME_LENGTH_REGEX, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REGEX } from '@/common/constants/regex.constants';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';

@InputType('AccountInput')
export class AccountInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  realName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field((type) => Int, { nullable: true })
  status?: number;

  @Field((type) => [Int], { nullable: true })
  roles?: number[];

  @Field({ nullable: true })
  emailCode?: string;
}

@InputType('UpdateAccountNameInput')
export class UpdateAccountNameInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(USERNAME_REGEX, { message: 'auth.USERNAME_INVALID_CHARS' })
  @Matches(USERNAME_LENGTH_REGEX, {
    message: 'auth.USERNAME_VALIDATE_LENGTH',
    context: { minLength: USERNAME_MIN_LENGTH, maxLength: USERNAME_MAX_LENGTH }
  })
  username: string;
}

@InputType('UpdateAccountAvatarInput')
export class UpdateAccountAvatarInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsUUID()
  avatar: string;
}

@InputType('UpdateAccountLanguageInput')
export class UpdateAccountLanguageInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  language: string;
}

@InputType('UpdateAccountThemeInput')
export class UpdateAccountThemeInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  theme: string;
}

@InputType('DeleteAccountInput')
export class DeleteAccountInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;
}

@InputType('DeleteAccountEmailSendInput')
export class DeleteAccountEmailSendInput {
  @Field({ nullable: true })
  language?: string;
}

@InputType('ValidateDeleteAccountCodeInput')
export class ValidateDeleteAccountCodeInput {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  code: string;
}

