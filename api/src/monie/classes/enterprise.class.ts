import { ApiProperty } from "@nestjs/swagger";

export class EnterpriseBranding {
    applicationTitle?: string;
    loginPageLogo?: string;
    workspaceLogo?: string;
    favicon?: string;
}

export class EnterpriseWorkspaceLimitation {
    enabled: boolean;
    limit: number;
    used: number;
}

export class EnterpriseLicense {
    status?: string;
    expiredAt?: string;
    worksapces?: EnterpriseWorkspaceLimitation;
}

export class Enterprise {
    @ApiProperty({ default: false })
    enableEmailCodeLogin?: boolean;

    @ApiProperty({ default: false })
    enableEmailPasswordLogin?: boolean;

    @ApiProperty({ default: false })
    allowRegister?: boolean;

    @ApiProperty({ default: false })
    allowCreateWorkspace?: boolean;

    branding?: EnterpriseBranding;
    License?: EnterpriseLicense;
}