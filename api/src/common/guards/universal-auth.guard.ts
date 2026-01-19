import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class UniversalAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const req = this.getRequest(context);

    // 打印调试信息
    // this.debugRequest(req, info);

    const url: string = req.originalUrl || req.url || '';
    if (url === '/graphql') {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass()
      ]);

      if (isPublic) {
        return true;
      }
    }

    if (url.startsWith('/internal/api')) {
      return true;
    }

    const publicPaths = [
      '/internal/api',
      '/health',
      '/metrics',
    ];
    const isPublicPath = publicPaths.some(path => url.startsWith(path));
    if (isPublicPath) {
      return true;
    }

    return super.canActivate(context);
  }

  private debugRequest(req: any, info: any) {
    console.log('\n📡 Request Details:');
    console.log('URL:', req.originalUrl || req.url); // /graphql
    console.log('Method:', req.method); // POST
    console.log('Headers:', req.headers); // 
    console.log('Body:', req.body); // query: ...
    console.log('GraphQL Operation:', info.fieldName);   // 如: login, currentUser
    console.log('Parent Type:', info.parentType.name);  // Query, Mutation, Subscription
    console.log('Path:', info.path); // { prev: undefined, key: 'emailPasswordLogin', typename: 'Mutation' }

    // 如果是 GraphQL 请求，body 会包含查询信息
    if (req.body) {
      console.log('GraphQL Query:', req.body.query);
      console.log('GraphQL Variables:', req.body.variables);
      console.log('Operation Name:', req.body.operationName);
    }
    console.log('\n');
  }
}
