import { ApiProperty } from '@nestjs/swagger';
import { License, LicenseLimitation } from './license.class';
import { EnterpriseBranding } from './enterprise.class';

export class Subscription {
    @ApiProperty({ default: 'sandbox' })
    plan: string = 'sandbox';

    @ApiProperty({ default: '' })
    internal: string = '';
}

export class Limitation {
    @ApiProperty({ default: 0 })
    size: number = 0;

    @ApiProperty({ default: 0 })
    limit: number = 0;
}

export class Billing {
    @ApiProperty({ default: false })
    enabled: boolean = false;

    @ApiProperty({ type: Subscription })
    subscription: Subscription = new Subscription();

    @ApiProperty({ type: Limitation })
    members: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    apps: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    vectorSpace: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    documentUploadQuota: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    annotationQuota: Limitation = new Limitation();

    @ApiProperty({ default: 'standard' })
    docsProcessing = "standard";

    @ApiProperty({ default: false })
    canReplaceLogo = false;

    @ApiProperty({ default: 0 })
    knowledgeRateLimit = 0;
}

export class Feature {
    @ApiProperty({ type: Billing })
    billing: Billing = new Billing();

    @ApiProperty({ type: Limitation })
    members: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    apps: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    vectorSpace: Limitation = new Limitation();

    @ApiProperty({ default: 10 })
    knowledgeRateLimit: number = 10;

    @ApiProperty({ type: Limitation })
    annotationQuota: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    documentsUploadQuota: Limitation = new Limitation();

    @ApiProperty({ default: '' })
    docsProcessing = '';

    @ApiProperty({ default: true })
    enableChangeEmail: boolean = true;

    @ApiProperty({ default: false })
    enableEmailCodeLogin: boolean = false;

    @ApiProperty({ default: false })
    enableEmailPasswordLogin: boolean = false;

    @ApiProperty({ default: false })
    enableSocialOauthLogin: boolean = false;

    @ApiProperty({ default: false })
    canReplaceLogo: boolean = false;

    @ApiProperty({ default: false })
    datasetOperatorEnabled: boolean = false;

    @ApiProperty({ type: LicenseLimitation })
    workspaceMembers: LicenseLimitation = new LicenseLimitation();

    @ApiProperty({ type: EnterpriseBranding })
    branding: EnterpriseBranding = new EnterpriseBranding();

    @ApiProperty({ default: false })
    allowRegister = false;

    @ApiProperty({ default: false })
    allowCreateWorkSpace = false;

    @ApiProperty({ type: License })
    license: License = new License();
}
