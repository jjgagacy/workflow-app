import { AccountEntity } from "@/account/entities/account.entity";
import { TenantEntity } from "@/account/entities/tenant.entity";
import { TenantService } from "@/service/tenant.service";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

export interface TenantContextData {
    tenant: TenantEntity;
    user: AccountEntity;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
    private context: TenantContextData;

    constructor(
        @Inject(REQUEST) private request: any,
        private readonly tenantService: TenantService
    ) {
        this.context = this.request.tenantContext || {
            tenant: this.request.tenant,
            user: this.request.user,
        }

        // 确保请求对象中也有引用
        this.request.tenantContext = this.context;
    }

    get tenant(): TenantEntity {
        return this.context.tenant;
    }

    get user(): AccountEntity {
        return this.context.user;
    }

    getTenantId(): string {
        return this.tenant?.id;
    }

    getUserId(): number {
        return this.user?.id;
    }

    setTenant(tenant: TenantEntity): this {
        this.context.tenant = tenant;
        this.request.tenant = tenant;
        return this;
    }

    setUser(user: AccountEntity): this {
        this.context.user = user;
        this.request.user = user;
        return this;
    }

    // 批量设置上下文
    setContext(context: Partial<TenantContextData>): this {
        if (context.tenant) {
            this.setTenant(context.tenant);
        }
        if (context.user) {
            this.setUser(context.user);
        }
        return this;
    }

    getContext(): TenantContextData {
        return { ...this.context };
    }

    // 验证方法
    requireTenant(): TenantEntity {
        if (!this.tenant) {
            throw new Error('Tenant context is required');
        }
        return this.tenant;
    }

    requireUser(): AccountEntity {
        if (!this.user) {
            throw new Error('User context is required');
        }
        return this.user;
    }

    async switchToTenant(tenantId: string): Promise<this> {
        const tenant = await this.tenantService.getTenant(tenantId);
        if (!tenant) {
            throw new Error(`Tenant not found: ${tenantId}`);
        }
        return this.setTenant(tenant);
    }
}