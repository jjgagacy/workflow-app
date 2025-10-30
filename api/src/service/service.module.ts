import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "./caches/enhance-cache.service";
import { BillingService } from "./billing/billing.service";
import { TenantService } from "./tenant.service";
import { GeneralCacheService } from "./caches/general-cache.service";
import { EnterpriseService } from "./enterprise/enterprise.service";
import { FeatureService } from "./feature.service";
import { EncryptionModule } from "@/encryption/encryption.module";
import { EncryptionService } from "@/encryption/encryption.service";
import { StorageModule } from "@/storage/storage.module";
import { StorageService } from "@/storage/storage.service";

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
        EncryptionService,
        StorageService,
    ],
    imports: [EncryptionModule, StorageModule],
    exports: [
        AuthAccountService,
        GeneralCacheService,
        EnhanceCacheService,
        BillingService,
        TenantService,
        EnterpriseService,
        FeatureService,
        StorageService,
    ],
})
export class ServiceModule { }
