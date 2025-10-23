import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class BillingConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    billingEnabled(): boolean {
        return toBoolean(this.configService.get<boolean>('BILLING_ENABLED', false));
    }

    billingAPISecretKey(): string {
        return this.configService.get<string>('BILLING_API_SECRET_KEY', '');
    }

    billingApiUrl(): string {
        return this.configService.get<string>('BILLING_API_URL', '');
    }
}