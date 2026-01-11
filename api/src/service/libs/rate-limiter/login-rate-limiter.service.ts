import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { Injectable } from "@nestjs/common";

export enum LoginRateLimitType {
  PASSWORD_LOGIN = 'password_login',
  CHANGE_PASSWORD = 'change_password',
}

export interface LoginRateLimitOptions {
  type: LoginRateLimitType;
  maxAttempts: number;
  timeWindow: number;
  lockDuration?: number;
}

export interface RateLimitResult {
  isRateLimited: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
  message?: string;
}

@Injectable()
export class LoginRateLimiterService {
  constructor(
    private readonly cacheService: EnhanceCacheService,
  ) { }

  async isRateLimited(identifier: string, options: LoginRateLimitOptions): Promise<boolean> {
    const key = this.getAttemptKey(identifier, options.type);
    const currentTime = Date.now();
    const windowStartTime = currentTime - options.timeWindow * 1000;

    await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);
    const attempts = await this.cacheService.zCard(key);
    return attempts >= options.maxAttempts;
  }

  async recordAttempt(
    identifier: string,
    options: LoginRateLimitOptions,
    success: boolean = false
  ): Promise<void> {
    const key = this.getAttemptKey(identifier, options.type);
    const currentTime = Date.now();
    const windowStartTime = currentTime - options.timeWindow * 1000;

    if (success) {
      await this.resetAttempts(identifier, options.type);
    } else {
      await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);
      await this.cacheService.zAdd(key, currentTime, `${currentTime}-${Math.random()}`);

      await this.cacheService.expire(key, options.timeWindow * 2);

      const attempts = await this.cacheService.zCard(key);
      if (attempts >= options.maxAttempts) {
        await this.lockAccount(identifier, options);
      }
    }
  }

  async getLockRemainingTime(identifier: string, type: LoginRateLimitType): Promise<number> {
    const lockKey = this.getLockKey(identifier, type);
    const lockUntil = await this.cacheService.get<string>(lockKey);

    if (!lockUntil) {
      return 0;
    }

    const lockTime = parseInt(lockUntil, 10);
    const currentTime = Date.now();
    const remaining = Math.max(0, lockTime - currentTime);

    return Math.ceil(remaining / 1000); // seconds
  }

  async resetAttempts(identifier: string, type: LoginRateLimitType): Promise<void> {
    const key = this.getAttemptKey(identifier, type);
    await this.cacheService.del(key);

    await this.unlockAccount(identifier, type);
  }

  private async unlockAccount(identifier: string, type: LoginRateLimitType): Promise<void> {
    const lockKey = this.getLockKey(identifier, type);
    await this.cacheService.del(lockKey);
  }

  async getRemainingAttempts(identifier: string, options: LoginRateLimitOptions): Promise<number> {
    const key = this.getAttemptKey(identifier, options.type);
    const currentTime = Date.now();
    const windowStartTime = currentTime - options.timeWindow * 1000;

    await this.cacheService.zRemRangeByScore(key, '-inf', windowStartTime);

    const attempts = await this.cacheService.zCard(key);
    return Math.max(0, options.maxAttempts - attempts);
  }

  private async lockAccount(identifier: string, options: LoginRateLimitOptions): Promise<void> {
    const lockKey = this.getLockKey(identifier, options.type);
    const lockDuration = options.lockDuration || (options.timeWindow * 5);

    const lockUntil = Date.now() + lockDuration * 1000;
    await this.cacheService.set(
      lockKey,
      lockUntil.toString(),
      lockDuration
    );
  }

  private getAttemptKey(identifier: string, type: LoginRateLimitType): string {
    const typeStr = type as string;
    return `rate_limiter:login:attempt:${typeStr}:${identifier}`;
  }

  private getLockKey(identifier: string, type: LoginRateLimitType): string {
    const typeStr = type as string;
    return `rate_limiter:login:lock:${typeStr}:${identifier}`;
  }

  private async isAccountLocked(identifier: string, type: LoginRateLimitType): Promise<{
    isLocked: boolean;
    lockedUntil?: Date;
  }> {
    const lockKey = this.getLockKey(identifier, type);
    const lockUntil = await this.cacheService.get<string>(lockKey);

    if (!lockUntil) {
      return { isLocked: false };
    }

    const lockTime = parseInt(lockUntil, 10);
    const currentTime = Date.now();

    if (currentTime < lockTime) {
      return {
        isLocked: true,
        lockedUntil: new Date(lockTime),
      };
    } else {
      await this.unlockAccount(identifier, type);
      return { isLocked: false };
    }
  }

  async getLoginStatus(identifier: string, type: LoginRateLimitType, timeWindow: number = 3600): Promise<{
    totalAttempts: number;
    successAttempts: number;
    failedAttempts: number;
    lastAttemptTime?: Date;
    isLocked: boolean;
    lockUntil?: Date;
  }> {
    const attemptKey = this.getAttemptKey(identifier, type);
    //const lockKey = this.getLockKey(identifier, type);

    const currentTime = Date.now();
    const windowStartTime = currentTime - timeWindow * 1000;

    await this.cacheService.zRemRangeByScore(attemptKey, '-inf', windowStartTime);
    const attempts = await this.cacheService.zRange(attemptKey, 0, -1);
    const lockInfo = await this.isAccountLocked(identifier, type);

    return {
      totalAttempts: attempts.length,
      successAttempts: 0,
      failedAttempts: attempts.length,
      lastAttemptTime: attempts.length > 0
        ? new Date(parseInt(attempts[attempts.length - 1].split('-')[0]))
        : undefined,
      isLocked: lockInfo.isLocked,
      lockUntil: lockInfo.lockedUntil,
    };
  }
}
