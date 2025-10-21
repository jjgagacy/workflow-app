import { GlobalLogger } from "@/logger/logger.service";
import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { GqlContextType, GqlExceptionFilter } from "@nestjs/graphql";
import { GraphQLException } from "../exceptions/graphql.exception";
import { GraphqlErrorCodes } from "../constants/graphql-error-codes";
import { Response } from 'express';
import { getErrorDetails } from "../utils/error";

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
    constructor(
        private readonly logger: GlobalLogger
    ) { }

    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof Error) {
            this.logger.error('GraphQLExceptionFilter', getErrorDetails(exception));
        } else {
            // todo 其他类型的错误
            this.logger.log("GraphQLExceptionFilter", exception);
        }
        const contextType = host.getType<GqlContextType>();

        if (contextType === "graphql") {
            if (exception instanceof BadRequestException) {
                return this.transformBadRequest(exception);
            }

            return new GraphQLException(
                exception.message || 'Internal server error',
                GraphqlErrorCodes.INTERNAL_SERVER_ERROR,
            );
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response
            .status(response.statusCode)
            .json({
                statusCode: response.statusCode,
                message: exception.message,
            });

        return exception;
    }

    transformBadRequest(exception: BadRequestException) {
        const response = exception.getResponse();

        return new GraphQLException(
            typeof response === 'string' ? response : (response as any).message,
            GraphqlErrorCodes.BAD_REQUEST,
            typeof response === 'object' ? (response as any) : {}
        );
    }
}
