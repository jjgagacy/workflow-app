import { ServiceCache } from "@/common/decorators/cache/service-cache.decorator";
import { Feature } from "@/monie/classes/feature.class";
import { SystemService } from "@/monie/system.service";
import { Injectable } from "@nestjs/common";
import { BillingService } from "./billing/billing.service";
import { EnterpriseService } from "./enterprise/enterprise.service";
import { EnumConverter, EnumUtils } from "@/common/utils/enums";
import { LicenseStatus } from "@/monie/classes/license.class";

@Injectable()
export class FeatureService {
    constructor(
        private readonly systemService: SystemService,
        private readonly billingService: BillingService,
        private readonly enterpriseService: EnterpriseService,
    ) { }

    @ServiceCache({ key: (tenantId: string) => `getFeature:${tenantId}` })
    async getFeatures(tenantId: string): Promise<Feature> {
        const feature = new Feature();

        this.fullfillFeatureFromEnv(feature);

        if (this.systemService.billingEnabled && tenantId) {
            await this.fullfillFeatureFromBillingApi(feature, tenantId);
        }

        if (this.systemService.enterpriseEnabled) {
            await this.fullfillFeatureFromEnterprise(feature);
        }

        return feature;
    }

    private fullfillFeatureFromEnv(feature: Feature): void {
        feature.canReplaceLogo = this.systemService.canReplaceLogo;
    }

    private async fullfillFeatureFromBillingApi(feature: Feature, tenantId: string): Promise<void> {
        const billingInfo = await this.billingService.getTenantSubscription(tenantId);

        feature.billing.enabled = billingInfo.enabled;
        feature.billing.subscription.plan = billingInfo.subscription.plan;
        feature.billing.subscription.internal = billingInfo.subscription.internal;

        if (feature.billing.subscription.plan == "sandbox") {
            // todo
        }

        if (billingInfo.members) {
            feature.members.size = billingInfo.members.size;
            feature.members.limit = billingInfo.members.limit;
        }

        if (billingInfo.apps) {
            feature.apps.size = billingInfo.apps.size;
            feature.apps.limit = billingInfo.apps.limit;
        }

        if (billingInfo.vectorSpace) {
            feature.vectorSpace.size = billingInfo.vectorSpace.size;
            feature.vectorSpace.limit = billingInfo.vectorSpace.limit;
        }

        if (billingInfo.documentUploadQuota) {
            feature.documentsUploadQuota.size = billingInfo.documentUploadQuota.size;
            feature.documentsUploadQuota.limit = billingInfo.documentUploadQuota.limit;
        }

        if (billingInfo.annotationQuota) {
            feature.annotationQuota.size = billingInfo.annotationQuota.size;
            feature.annotationQuota.limit = billingInfo.annotationQuota.limit;
        }

        if (billingInfo.docsProcessing) {
            feature.docsProcessing = billingInfo.docsProcessing;
        }

        if (billingInfo.canReplaceLogo !== undefined) {
            feature.canReplaceLogo = billingInfo.canReplaceLogo;
        }

        if (billingInfo.knowledgeRateLimit) {
            feature.knowledgeRateLimit = billingInfo.knowledgeRateLimit;
        }
    }

    private async fullfillFeatureFromEnterprise(feature: Feature) {
        const enterpriseInfo = await this.enterpriseService.getEnterpriseInfo();

        if (enterpriseInfo.branding) {
            feature.branding.applicationTitle = enterpriseInfo.branding.applicationTitle;
            feature.branding.loginPageLogo = enterpriseInfo.branding.loginPageLogo;
            feature.branding.workspaceLogo = enterpriseInfo.branding.workspaceLogo;
            feature.branding.favicon = enterpriseInfo.branding.favicon;
        }

        if (enterpriseInfo.License) {
            const licenseInfo = enterpriseInfo.License;

            if (licenseInfo.status) {
                feature.license.status = EnumConverter.toEnum(LicenseStatus, licenseInfo.status);
            }
            if (licenseInfo.expiredAt) {
                feature.license.expiredAt = licenseInfo.expiredAt;
            }
            if (licenseInfo.worksapces) {
                feature.license.workspaces.enabled = licenseInfo.worksapces.enabled;
                feature.license.workspaces.size = licenseInfo.worksapces.used;
                feature.license.workspaces.limit = licenseInfo.worksapces.limit;
            }
        }
    }
}