import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getSafeNumber } from "../helpers/safe-number";
import { DefaultConfigValues } from "../constants/default-config-value";

@Injectable()
export class AppExecutionConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    appMaxExecutionTime(): number {
        const sec = this.configService.get<number>('APP_MAX_EXECUTION_TIME', DefaultConfigValues.APP_MAX_EXECUTION_TIME);
        return getSafeNumber(sec, DefaultConfigValues.APP_MAX_EXECUTION_TIME);
    }

    // Maximum number of concurrent active requets (0 for unlimited)
    appMaxActiveRequests(): number {
        const maxReqests = this.configService.get<number>('APP_MAX_ACTIVE_REQUESTS', DefaultConfigValues.APP_MAX_ACTIVE_REQUESTS);
        return getSafeNumber(maxReqests, DefaultConfigValues.APP_MAX_ACTIVE_REQUESTS);
    }

    // Maximum number of requests per app per day
    appMaxRateLimit(): number {
        const rateLimit = this.configService.get<number>('APP_MAX_RATE_LIMIT', DefaultConfigValues.APP_MAX_RATE_LIMIT);
        return getSafeNumber(rateLimit, DefaultConfigValues.APP_MAX_RATE_LIMIT);
    }
}