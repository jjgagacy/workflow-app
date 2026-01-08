import { ArgumentsHost, Catch } from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
  }
}
