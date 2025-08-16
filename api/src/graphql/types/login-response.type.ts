import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('LoginResponse')
export class LoginResponse {
  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  name?: string;

  @Field((returns) => [String], { nullable: true })
  roles?: string[];

  @Field({ nullable: true })
  isSuper?: boolean;
}
