import { USERNAME_LENGTH_REGEX, USERNAME_REGEX } from '@/common/constants/regex.constants';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, Matches } from 'class-validator';

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

  @Field({ nullable: true })
  emailCode: string;
}

@InputType('UpdateAccountNameInput')
export class UpdateAccountNameInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(USERNAME_LENGTH_REGEX, { message: 'auth.USERNAME_VALIDATE_LENGTH' })
  @Matches(USERNAME_REGEX, { message: 'auth.USERNAME_INVALID_CHARS' })
  username: string;
}

@InputType('UpdateAccountAvatarInput')
export class UpdateAccountAvatarInput {
  @Field({ nullable: false })
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
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

