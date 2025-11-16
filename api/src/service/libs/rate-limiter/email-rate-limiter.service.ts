import { Injectable } from "@nestjs/common";
import { EnhanceCacheService } from "../../../common/services/cache/enhance-cache.service";

export enum EmailRateLimitType {
    RESET_PASSWORD = 'reset_password',
    EMAIL_CODE_LOGIN = 'email_code_login',
    EMAIL_CODE_ACCOUNT_DELETION = 'email_code_account_deletion',
    CHANGE_EMAIL = 'change_email',
}

export interface EmailRateLimitOptions {
    type: EmailRateLimitType;
    maxAttempts: number;
    timeWindow: number; // second
}

@Injectable()
export class EmailRateLimiterService {
    constructor(
        private readonly cacheService: EnhanceCacheService
    ) { }

    async isRateLimited(email: string, options: EmailRateLimitOptions): Promise<boolean> {
        const key = this.getKey(email, options.type);
        const currentTime = Date.now();
        const windowStartTime = currentTime - options.timeWindow * 1000;

        // remove early records
        await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);
        // get current window try attempts
        const attempts = await this.cacheService.zCard(key);

        return attempts >= options.maxAttempts;
    }

    // Cannot use second-level timestamp. If two calls occur with the same second, both the 
    // value and score become identical. As a result, Redis `ZADD` treats them as duplicate
    // members. Some clients may raise issue.
    async incrementRateLimited(email: string, options: EmailRateLimitOptions): Promise<void> {
        const key = this.getKey(email, options.type);
        const currentTime = Date.now();
        const windowStartTime = currentTime - options.timeWindow * 1000;

        await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);
        await this.cacheService.zAdd(key, currentTime, `${currentTime}-${Math.random()}`);

        // set expire time (commonly twice of current time window)
        await this.cacheService.expire(key, options.timeWindow * 2);
    }

    async resetRateLimit(email: string, type: EmailRateLimitType): Promise<void> {
        const key = this.getKey(email, type);
        await this.cacheService.del(key);
    }

    async getRemainingAttempts(email: string, options: EmailRateLimitOptions): Promise<number> {
        const key = this.getKey(email, options.type);
        const currentTime = Date.now();
        const windowStartTime = currentTime - options.timeWindow * 1000;

        // remove early records
        await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);

        const attempts = await this.cacheService.zCard(key);

        return Math.max(0, options.maxAttempts - attempts);
    }

    private getKey(email: string, type: EmailRateLimitType): string {
        const typeStr = type as string;
        return `rate_limiter:${typeStr}:${email}`;
    }
}