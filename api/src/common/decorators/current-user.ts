import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // 将常规执行上下文转换为GraphQL执行上下文
    const ctx = GqlExecutionContext.create(context);
    // 从GraphQL上下文中获取请求对象，并返回用户信息
    return ctx.getContext().req.user;
  }
);
