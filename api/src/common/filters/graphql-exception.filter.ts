import { GlobalLogger } from "@/logger/logger.service";
import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { GqlArgumentsHost, GqlContextType, GqlExceptionFilter } from "@nestjs/graphql";
import { GraphQLException } from "../exceptions/graphql.exception";
import { GraphqlErrorCodes } from "../constants/graphql-error-codes";
import { Response } from 'express';
import { getErrorDetails } from "../utils/error";
import { I18nHelperService } from "@/i18n-global/i18n.service";
import { I18nValidationException } from "nestjs-i18n";

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  constructor(
    private readonly logger: GlobalLogger,
    private readonly i18nHelper: I18nHelperService,
  ) { }

  async catch(exception: any, host: ArgumentsHost) {
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

      if (exception instanceof I18nValidationException) {
        const gqlHost = GqlArgumentsHost.create(host);
        const context = gqlHost.getContext();
        const request = context?.req;
        const message = await this.i18nHelper.translateValidationErrors(exception.errors, request)
        return new GraphQLException(
          message[0] && message[0].translatedMessages?.[0] ? message[0].translatedMessages[0] : 'Validation error',
          GraphqlErrorCodes.VALIDATION_ERROR,
        );
      }

      return new GraphQLException(
        exception.message || 'Internal server error',
        GraphqlErrorCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 处理 HttpException
    if (exception.getStatus && exception.getResponse) {
      const status = exception.getStatus();
      // const exceptionResponse = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
      return;
    }

    // 处理其他类型的异常
    const statusCode = this.getStatusCode(exception);
    response
      .status(statusCode)
      .json({
        statusCode: statusCode,
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

  private getStatusCode(exception: any): number {
    // 根据异常类型返回不同的状态码
    // console.log('--', exception.name);
    if (exception.name === 'ValidationError') return 400;
    if (exception.name === 'UnauthorizedError') return 401;
    if (exception.name === 'ForbiddenError') return 403;
    if (exception.name === 'NotFoundError') return 404;
    if (exception.name === 'ConflictError') return 409;
    return 500; // 默认服务器错误
  }

  private getMessage(exception: any): string {
    return exception.message || 'Internal server error';
  }
}
