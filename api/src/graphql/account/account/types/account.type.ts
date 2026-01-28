import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Account')
export class Account {
  @Field((type) => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  realName: string;

  @Field()
  email: string;

  @Field()
  mobile: string;

  @Field((type) => Int)
  status: number;

  @Field()
  created_at: string;

  @Field()
  created_by: string;

  @Field((type) => [String], { nullable: true })
  roles?: string[];

  @Field((type) => [String], { nullable: true })
  roleKeys?: string[];

  @Field({ nullable: true })
  last_ip?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  isOwner?: boolean;
}
