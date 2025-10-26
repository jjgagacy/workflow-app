import { AccountService } from "@/account/account.service";
import { TenantService } from "@/service/tenant.service";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
    constructor(
        private readonly tenantService: TenantService,
        private readonly accountService: AccountService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        console.log('middleware tenant...');
        next();
    }
}