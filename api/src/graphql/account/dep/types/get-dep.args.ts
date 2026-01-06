import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetDepArgs {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  parent?: string;

  @Field({ nullable: true })
  key?: string;
}
