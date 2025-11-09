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

@InputType('UpdateAccountNameInput')
export class UpdateAccountNameInput {
  @Field({ nullable: false })
  username: string;
}

@InputType('UpdateAccountAvatarInput')
export class UpdateAccountAvatarInput {
  @Field({ nullable: false })
  avatar: string;
}

@InputType('UpdateAccountLanguageInput')
export class UpdateAccountLanguageInput {
  @Field({ nullable: false })
  language: string;
}

@InputType('UpdateAccountThemeInput')
export class UpdateAccountThemeInput {
  @Field({ nullable: false })
  theme: string;
}

