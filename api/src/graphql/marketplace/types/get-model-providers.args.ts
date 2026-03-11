import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetModelProvidersArgs {
  @Field(() => [String], { nullable: true, description: "List of provider names to exclude from the results" })
  excludes?: string[];

  @Field(() => String, { nullable: true, description: "Category to filter providers by" })
  category?: string;
}
