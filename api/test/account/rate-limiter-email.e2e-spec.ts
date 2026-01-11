import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { EmailRateLimiterService, EmailRateLimitOptions, EmailRateLimitType } from '@/service/libs/rate-limiter/email-rate-limiter.service';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';

describe('RateLimiter (e2e)', () => {
  jest.setTimeout(30000); // 默认 300ms 太短，这里改成 30 秒
  console.log('✅ Jest timeout set to 30s');

  let app: INestApplication<App>;
  let authAccountService: AuthAccountService;
  let rateLimiterService: EmailRateLimiterService;
  let cacheService: EnhanceCacheService;
  const testAccountId = 15;
  const testAccountEmail = 'test3@example.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authAccountService = app.get<AuthAccountService>(AuthAccountService);
    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    rateLimiterService = app.get<EmailRateLimiterService>(EmailRateLimiterService);
  });

  it('should initialize redis client', async () => {
    const redisClient = await cacheService.getRedisClient();
    expect(redisClient).toBeDefined();
  });

  describe('isRateLimit', () => {
    const options: EmailRateLimitOptions = {
      type: EmailRateLimitType.RESET_PASSWORD,
      maxAttempts: 3,
      timeWindow: 60, // 60 seconds
    };

    beforeEach(async () => {
      await rateLimiterService.resetRateLimit(testAccountEmail, options.type);
    });

    it('should return false when no attempts made', async () => {
      const result = await rateLimiterService.isRateLimited(testAccountEmail, options);

      expect(result).toBe(false);
    });

    it('should return false when attempts are below limit', async () => {
      await rateLimiterService.incrementRateLimited(testAccountEmail, options);
      await new Promise(resolve => setTimeout(resolve, 500));
      await rateLimiterService.incrementRateLimited(testAccountEmail, options);

      // console.log(await rateLimiterService.getRemainingAttempts(testAccountEmail, options)); // 1

      const result = await rateLimiterService.isRateLimited(testAccountEmail, options);
      expect(result).toBe(false);
    });

    it('should return true when attempts reach limit', async () => {
      await rateLimiterService.incrementRateLimited(testAccountEmail, options);
      await rateLimiterService.incrementRateLimited(testAccountEmail, options);
      await rateLimiterService.incrementRateLimited(testAccountEmail, options);

      // console.log(await rateLimiterService.getRemainingAttempts(testAccountEmail, options)); // 0
      const result = await rateLimiterService.isRateLimited(testAccountEmail, options);
      expect(result).toBe(true);
    });
  });

  // afterAll(async () => {
  //     await app.close();
  // });
});
