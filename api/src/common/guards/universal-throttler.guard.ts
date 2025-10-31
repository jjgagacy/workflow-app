import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class UniversalThrottlerGuard extends ThrottlerGuard {

    protected getRequestResponse(context: ExecutionContext): { req: Record<string, any>; res: Record<string, any>; } {
        const requestType = context.getType() as string;

        if (requestType === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            const ctx = gqlContext.getContext();
            return { req: ctx.req, res: ctx.res };
        }
        else if (requestType === 'http') {
            const http = context.switchToHttp();
            return { req: http.getRequest(), res: http.getResponse() };
        }

        return super.getRequestResponse(context);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.shouldSkipThrottling(context)) {
            return true;
        }

        return super.canActivate(context);
    }

    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ip;
    }

    // 生成存储键
    generateKey(context: ExecutionContext, tracker: string): string {
        const requestType = context.getType() as string;
        let reqType = requestType === 'graphql' ? 'gql' : 'rest';
        return `throttler:${reqType}:${tracker}`;
    }

    private shouldSkipThrottling(context: ExecutionContext): boolean {
        const requestType = context.getType() as string;

        if (requestType === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            //console.log('throtter skip check (graphql):', info);
            // 跳过 introspection 查询
            if (info.operation?.operation === 'query' && info.fieldName === '__schema') {
                return true;
            }
            const skipOperations = ['__type', 'introspectionQuery'];
            if (skipOperations.includes(info.fieldName)) {
                return true;
            }
        } else if (requestType == 'http') {
            // REST API 跳过逻辑
            const http = context.switchToHttp();
            const request = http.getRequest();
            const path = request.path;
            // console.log('throtter skip check (http):', path);
            // 跳过健康检查端点
            const skipPaths = ['/health', '/metrics', '/favicon.ico'];
            if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
                return true;
            }
        }
        return false;
    }
}