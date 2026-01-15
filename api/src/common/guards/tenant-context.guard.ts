import { AccountService } from "@/account/account.service";
import { TenantService } from "@/service/tenant.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantService: TenantService,
    private readonly accountService: AccountService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestType = context.getType() as string;
    let req: Request;

    if (requestType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      req = ctx.req;
    } else {
      req = context.switchToHttp().getRequest();
    }
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    if (!tenantId) {
      throw new BadRequestException('Workspace id is required');
    }

    const tenant = await this.tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new NotFoundException('Workspace not found');
    }

    (req as any).tenant = tenant;
    // TODO: user
    // console.log('tenant context guard...');
    return true;
  }

  private getTenantId(request: any): string {
    // 支持多种方式获取 tenant_id
    return request.body?.tenant_id ||
      request.query?.tenant_id ||
      request.params?.tenant_id ||
      request.headers['x-tenant-id'];
  }

  private getUserId(request: any): string {
    // 支持多种方式获取 user_id
    return request.body?.user_id ||
      request.query?.user_id ||
      request.params?.user_id ||
      request.user?.id; // 从认证信息中获取
  }

}