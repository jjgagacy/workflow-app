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

  @Field({ nullable: false })
  expiresIn: number;
}

@ObjectType('UserInfoResponse')
export class UserInfoResponse {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
}

@ObjectType('TenantResponse')
export class TenantResponse {
  @Field()
  tenant_id: string;
  @Field()
  name: string;

  @Field()
  plan: string;
}
