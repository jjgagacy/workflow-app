import { ApiProperty } from '@nestjs/swagger';
import { LicenseLimitation } from './license.class';

export class Subscription {
    @ApiProperty({ default: 'sandbox' })
    plan: string = 'sandbox';

    @ApiProperty({ default: '' })
    internal: string = '';
}

export class Billing {
    @ApiProperty({ default: false })
    enabled: boolean = false;

    @ApiProperty({ type: Subscription })
    subscription: Subscription = new Subscription();
}

export class Limitation {
    @ApiProperty({ default: 0 })
    size: number = 0;

    @ApiProperty({ default: 0 })
    limit: number = 0;
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
    annotationQuotaLimit: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    documentsUploadQuotaLimit: Limitation = new Limitation();

    @ApiProperty({ type: Limitation })
    docsProcessing: Limitation = new Limitation();

    @ApiProperty({ default: false })
    canReplaceLogo: boolean = false;

    @ApiProperty({ default: false })
    datasetOperatorEnabled: boolean = false;

    @ApiProperty({ type: LicenseLimitation })
    workspaceMembers: LicenseLimitation = new LicenseLimitation();
}
