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
}