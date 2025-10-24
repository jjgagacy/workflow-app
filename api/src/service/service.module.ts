import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "./caches/enhance-cache.service";
import { BillingService } from "./billing/billing.service";
import { TenantService } from "./tenant.service";

@Global()
@Module({
    providers: [
        AuthAccountService,
        EnhanceCacheService,
        BillingService,
        TenantService,
    ],
    imports: [],
    exports: [
        AuthAccountService,
        EnhanceCacheService,
        BillingService,
        TenantService,
    ],
})
export class ServiceModule { }
