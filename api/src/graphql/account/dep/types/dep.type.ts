import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Account } from '../../account/types/account.type';

@ObjectType('Dep')
export class Dep {
  @Field((types) => Int)
  id: number;
  @Field()
  key: string;
  @Field()
  name: string;
  @Field()
  parent: string;
  @Field()
  remarks: string;
  @Field((types) => Account, { nullable: true })
  manager?: { id: number; username: string; realName: string; };
}
