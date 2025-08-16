import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('MenuInput')
export class MenuInput {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  key: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  parent: string;

  @Field((type) => Int, { nullable: true })
  status?: number;

  @Field((type) => Int, { nullable: true })
  sort?: number;

  @Field({ nullable: true })
  moduleId: number;
}
