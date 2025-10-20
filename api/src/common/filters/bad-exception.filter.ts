import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Response } from 'express';
import { GqlArgumentsHost, GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(BadRequestException)
export class BadExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const contextType = host.getType<GqlContextType>();

        if (contextType === 'http') {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse<Response>();
            response
                .status(500)
                .json({
                    statusCode: 500,
                    message: exception.message,
                });
        } else {
            // 如果是 GraphQL 请求，强制返回 JSON 格式的错误
            throw new GraphQLError(exception.message, null, null, null, null, null, {
                statusCode: 500,
                message: exception.message,
            });
        }
    }
}


// https://draganatanasov.com/2019/06/24/handle-your-exceptions-by-using-global-exception-filter-in-a-nestjs-application/
// https://docs.nestjs.com/exception-filters
// https://docs.nestjs.com/exception-filters#built-in-http-exceptions
