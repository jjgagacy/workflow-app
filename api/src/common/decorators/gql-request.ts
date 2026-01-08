import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

export const GqlRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): Request => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (!request) {
      throw new Error('HTTP request object not found in GraghQL context');
    }
    return request;
  }
);
