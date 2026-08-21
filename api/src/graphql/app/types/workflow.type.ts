import { InputType, Field } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType('WorkflowDraftInput')
export class WorkflowDraftInput {
  @Field()
  appId!: string;

  @Field(() => GraphQLJSON)
  graph!: Record<string, any>;

  @Field(() => GraphQLJSON)
  features!: Record<string, any>;

  @Field(() => GraphQLJSON)
  environmentVariables!: Record<string, any>;

  @Field(() => GraphQLJSON)
  sessionVariables!: Record<string, any>;
}
