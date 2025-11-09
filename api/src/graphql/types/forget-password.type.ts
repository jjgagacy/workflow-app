import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType('ForgetPasswordInput')
export class ForgetPasswordInput {
  @Field()
  email: string;

  @Field()
  token: string;

  @Field()
  code: string;

  @Field()
  language: string;
}

@InputType('ForgetPasswordCheckInput')
export class ForgetPasswordCheckInput {
  @Field()
  email: string;

  @Field()
  code: string;

  @Field()
  language: string;
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

@ObjectType('ForgetPasswordResetInput')
export class ForgetPasswordResetInput {
  @Field()
  token: string;

  @Field()
  newPassword: string;

  @Field()
  passwordConfirm: string;
}

