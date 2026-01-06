import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Perm } from '../../perm/types/perm.type';

@ObjectType('Module')
export class Module {
  @Field((type) => Int)
  id?: number;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field((type) => [Perm], { nullable: true })
  perms?: Perm[];
}
