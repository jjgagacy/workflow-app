
import { TenantService } from "@/service/tenant.service";
import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class SetTenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    if (tenantId) {
      await this.setContext(req, tenantId);
    }
    next();
  }

  private extractTenantId(req: Request): string {
    const tenantHeader = req.headers['x-tenant-id'] || req.headers['tenant-id'];
    if (tenantHeader) {
      return Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    }

    const tenantQuery = req.query.tenantId as string;
    if (tenantQuery) {
      return tenantQuery;
    }

    return '';
  }

  private async setContext(req: Request, tenantId: string): Promise<void> {
    const tenant = await this.tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    (req as any).tenant = tenant;
  }
}
