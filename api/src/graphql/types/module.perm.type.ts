import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ModulePerm')
export class ModulePerm {
  @Field()
  key: string;

  @Field()
  name: string;
}
