import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Route')
export class Route {
  @Field()
  key: string;
  @Field()
  label: string;
  @Field({ nullable: true })
  path?: string;
  @Field({ nullable: true })
  icon?: string;
  @Field((returns) => [String], { nullable: true })
  roles?: string[];
  @Field({ nullable: true })
  lazy?: boolean;
  @Field({ nullable: true })
  parent?: string;
  @Field()
  sort: number;
}

// https://typegraphql.com/docs/types-and-fields.html
