import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppExecutionConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    appMaxExecutionTime(): number {
        const sec = this.configService.get<number>('APP_MAX_EXECUTION_TIME', 1200);
        return Number(sec);
    }

    // Maximum number of concurrent active requets (0 for unlimited)
    appMaxActiveRequests(): number {
        const maxReqests = this.configService.get<number>('APP_MAX_ACTIVE_REQUESTS', 0);
        return Number(maxReqests);
    }

    // Maximum number of requests per app per day
    appMaxRateLimit(): number {
        const rateLimit = this.configService.get<number>('APP_MAX_RATE_LIMIT', 5000);
        return Number(rateLimit);
    }
}