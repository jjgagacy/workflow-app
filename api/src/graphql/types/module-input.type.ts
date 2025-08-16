import { Field, InputType } from '@nestjs/graphql';

@InputType('ModuleInput')
export class ModuleInput {
  @Field({ nullable: true })
  id?: number;

  @Field()
  key: string;

  @Field()
  name: string;
}
