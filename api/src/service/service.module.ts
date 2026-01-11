import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "../common/services/cache/enhance-cache.service";
import { BillingService } from "./billing/billing.service";
import { TenantService } from "./tenant.service";
import { GeneralCacheService } from "../common/services/cache/general-cache.service";
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
import { ModelRuntimeModule } from "@/ai/model_runtime/model_runtime.module";
import { ModelProviderService } from "./model-provider.service";
import { ProviderManager } from "@/ai/model_runtime/services/provider-manager";
import { ProviderService } from "@/ai/model_runtime/services/provider.service";
import { HostConfiguration } from "@/ai/plugin/services/host-configuration";
import { LoginRateLimiterService } from "./libs/rate-limiter/login-rate-limiter.service";

@Global()
@Module({
  imports: [EncryptionModule, StorageModule, MailModule, ModelRuntimeModule],
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
    LoginRateLimiterService,
    TokenManagerService,
    LocationService,
    MailService,
    DeviceService,
    ProviderManager,
    ProviderService,
    ModelProviderService,
    HostConfiguration,
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
    LoginRateLimiterService,
    TokenManagerService,
    LocationService,
    DeviceService,
  ],
})
export class ServiceModule { }
