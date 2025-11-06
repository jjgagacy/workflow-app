import { AccountService } from "@/account/account.service";
import { TenantService } from "@/service/tenant.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TenantContextGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tenantService: TenantService,
        private readonly accountService: AccountService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const tenantId = this.getTenantId(req);
        const userId = this.getUserId(req);

        if (!tenantId) {
            throw new BadRequestException('tenant_id is required');
        }

        const tenant = await this.tenantService.getTenant(tenantId);
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        (req as any).tenant = tenant;
        // todo user

        console.log('tenant context guard...');
        return true;
    }

    private getTenantId(request: any): string {
        // 支持多种方式获取 tenant_id
        return request.body?.tenant_id ||
            request.query?.tenant_id ||
            request.params?.tenant_id;
    }

    private getUserId(request: any): string {
        // 支持多种方式获取 user_id
        return request.body?.user_id ||
            request.query?.user_id ||
            request.params?.user_id ||
            request.user?.id; // 从认证信息中获取
    }

}