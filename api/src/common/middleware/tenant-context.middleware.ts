import { AccountService } from "@/account/account.service";
import { TenantService } from "@/service/tenant.service";
import { BadRequestException, Injectable, NestMiddleware, NotFoundException, Req } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly accountService: AccountService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    console.log('tenant context middleware...');

    if (!tenantId) {
      throw new BadRequestException('tenant_id is required');
    }

    await this.setContext(req, tenantId, userId);
    next();
  }

  /**
   * 
   * @param req 获取请求数据，中间件获取不到url路径参数，参数解析是在中间件执行之后的路由处理阶段进行的
   * 
   * curl请求示例：
        curl -X POST \
        -H "Content-Type: application/json" \
        -d '{"name":"John","age":30,"city":"New York","tenant_id":"106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a"}' \
        "127.0.0.1:3001/internal/api"

        # 带认证的请求
        curl -X GET \
        -H "Authorization: Bearer your-token" \
        http://localhost:3000/internal/api?tenant_id=106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a
   * @returns 
   */
  private getTenantId(req: Request): string {
    return req.body?.tenant_id ||
      req.query?.tenant_id as string;
  }

  /**
   * @param req 
   * @returns 
   */
  private getUserId(req: Request): string {
    return req.header['x-tenant-id'] ||
      req.body?.user_id ||
      req.query?.user_id as string;
  }

  private async setContext(req: Request, tenantId: string, userId?: string): Promise<void> {
    const tenant = await this.tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // todo userId

    // 设置到请求上下文中
    (req as any).tenant = tenant;
  }
}
