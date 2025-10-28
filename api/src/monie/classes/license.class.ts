import { ApiProperty } from "@nestjs/swagger";

export enum LicenseStatus {
    NONE = 'none',
    INACTIVE = 'inactive',
    ACTIVE = 'active',
    EXPIRING = 'expiring',
    EXPIRED = 'expired',
    LOST = 'lost',
}

export class LicenseLimitation {
    @ApiProperty({ description: 'Whether license limitation is currently active', default: false })
    enabled: boolean = false;

    @ApiProperty({ description: 'Number of resources already consumed', default: 0 })
    size: number = 0;

    @ApiProperty({ description: 'Maximum number of resources allowed', default: 0 })
    limit: number = 0;

    isAvailable(required: number = 1): boolean {
        if (!this.enabled || this.limit == 0) {
            return true;
        }
        return (this.limit - this.size) > required;
    }
}

export class License {
    @ApiProperty({ enum: LicenseStatus, default: LicenseStatus.NONE })
    status: LicenseStatus = LicenseStatus.NONE;

    @ApiProperty({ default: '' })
    expiredAt: string = '';

    @ApiProperty({ type: LicenseLimitation })
    workspaces: LicenseLimitation = new LicenseLimitation();
}

export class Branding {
    @ApiProperty({ default: false })
    enabled: boolean = false;

    @ApiProperty({ default: '' })
    applicationTitle: string = '';

    @ApiProperty({ default: '' })
    loginPageLogo: string = '';

    @ApiProperty({ default: '' })
    workspaceLogo: string = '';

    @ApiProperty({ default: '' })
    favicon: string = '';
}




