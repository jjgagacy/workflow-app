import { Field, InputType, Int } from '@nestjs/graphql';

@InputType('MenuInput')
export class MenuInput {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field({ nullable: false })
  key!: string;

  @Field({ nullable: false })
  name!: string;

  @Field({ nullable: false })
  parent!: string;

  @Field((type) => Int, { nullable: true })
  status?: number;

  @Field((type) => Int, { nullable: true })
  sort?: number;

  @Field({ nullable: true })
  moduleId?: number;
}
