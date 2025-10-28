import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "./caches/enhance-cache.service";
import { BillingService } from "./billing/billing.service";
import { TenantService } from "./tenant.service";
import { GeneralCacheService } from "./caches/general-cache.service";
import { EnterpriseService } from "./enterprise/enterprise.service";
import { FeatureService } from "./feature.service";

@Global()
@Module({
    providers: [
        AuthAccountService,
        GeneralCacheService,
        EnhanceCacheService,
        BillingService,
        TenantService,
        EnterpriseService,
        FeatureService,
    ],
    imports: [],
    exports: [
        AuthAccountService,
        GeneralCacheService,
        EnhanceCacheService,
        BillingService,
        TenantService,
        EnterpriseService,
        FeatureService,
    ],
})
export class ServiceModule { }
