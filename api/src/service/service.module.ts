import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "./caches/enhance-cache.service";
import { BillingService } from "./billing/billing.service";

@Global()
@Module({
    providers: [
        AuthAccountService,
        EnhanceCacheService,
        BillingService,
    ],
    imports: [],
    exports: [
        AuthAccountService,
        EnhanceCacheService,
        BillingService,
    ],
})
export class ServiceModule { }
