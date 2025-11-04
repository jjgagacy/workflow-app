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
import { EmailRateLimiterService } from "./libs/rate-limiter/email-rate-limiter.service";
import { TokenManagerService } from "./libs/token-manager.service";
import { LocationService } from "./libs/location.service";
import { MailModule } from "@/mail/mail.module";
import { MailService } from "@/mail/mail.service";
import { DeviceService } from "./libs/device.service";

@Global()
@Module({
    imports: [EncryptionModule, StorageModule, MailModule],
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
        EmailRateLimiterService,
        TokenManagerService,
        LocationService,
        MailService,
        DeviceService,
    ],
    exports: [
        AuthAccountService,
        GeneralCacheService,
        EnhanceCacheService,
        BillingService,
        TenantService,
        EnterpriseService,
        FeatureService,
        StorageService,
        EmailRateLimiterService,
        TokenManagerService,
        LocationService,
        DeviceService,
    ],
})
export class ServiceModule { }
