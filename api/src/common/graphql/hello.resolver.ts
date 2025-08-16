import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class HelloResolver {
  // This resolver can be expanded with queries and mutations as needed
  @Query(() => String)
  async hello(): Promise<string> {
    return "Hello World!";
  }
}