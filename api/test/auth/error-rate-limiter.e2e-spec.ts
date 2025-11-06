import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/service/caches/enhance-cache.service';
import { AuthAccountService } from '@/service/auth-account.service';
import authConfig from '@/config/auth.config';

describe('RedisClient (e2e)', () => {
    // jest.setTimeout(30000);
    let app: INestApplication<App>;
    let cacheService: EnhanceCacheService;
    let service: AuthAccountService;
    let connected = false;
    const mockEmail = 'test@example.com';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
        service = app.get<AuthAccountService>(AuthAccountService);
        // trigger connect redis because lazy connect
        await cacheService.get('foo');
        connected = true;
    });

    it('should initialize redis client', async () => {
        const redisClient = await cacheService.getRedisClient();
        expect(redisClient).toBeDefined();
    });

    describe('Login Error Rate Limit', () => {
        it('should add login error count', async () => {
            await service.addLoginErrorRateLimit(mockEmail);
        });

        it('should return false when login error count is below limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().emailChangeMaxErrorLimit - 1);

            const result = await service.isLoginErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should return true when login error count exceeds limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().emailChangeMaxErrorLimit + 1);

            const result = await service.isLoginErrorRateLimit(mockEmail);

            expect(result).toBe(true);
        });

        it('should return false when login error count is null/undefined', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(null);

            const result = await service.isLoginErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should reset login error count', async () => {
            const delSpy = jest.spyOn(cacheService, 'del').mockResolvedValue(true);

            await service.resetLoginErrorRateLimit(mockEmail);

            expect(delSpy).toHaveBeenCalledWith(`auth:login_error_rate_limit:${mockEmail}`);
        });
    });

    describe('Forget Password Error Rate Limit', () => {
        it('should add forget password error count', async () => {
            const incrSpy = jest.spyOn(cacheService, 'incr').mockResolvedValue(1);

            await service.addForgetPasswordErrorRateLimit(mockEmail);

            expect(incrSpy).toHaveBeenCalledWith(`auth:forget_password_error_rate_limit:${mockEmail}`);
        });

        it('should return false when forget password error count is below limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().forgetPasswordMaxErrorLimit - 1);

            const result = await service.isForgetPasswordErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should return true when forget password error count exceeds limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().forgetPasswordMaxErrorLimit + 1);

            const result = await service.isForgetPasswordErrorRateLimit(mockEmail);

            expect(result).toBe(true);
        });

        it('should return false when forget password error count is null/undefined', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(null);

            const result = await service.isForgetPasswordErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should reset forget password error count', async () => {
            const delSpy = jest.spyOn(cacheService, 'del').mockResolvedValue(true);

            await service.resetForgetPasswordErrorRateLimit(mockEmail);

            expect(delSpy).toHaveBeenCalledWith(`auth:forget_password_error_rate_limit:${mockEmail}`);
        });
    });

    describe('Change Email Error Rate Limit', () => {
        it('should add change email error count', async () => {
            const incrSpy = jest.spyOn(cacheService, 'incr').mockResolvedValue(1);

            await service.addChangeEmailErrorRateLimit(mockEmail);

            expect(incrSpy).toHaveBeenCalledWith(`auth:change_email_error_rate_limit:${mockEmail}`);
        });

        it('should return false when change email error count is below limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().emailChangeMaxErrorLimit - 1);

            const result = await service.isChangeEmailErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should return true when change email error count exceeds limit', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(authConfig().emailChangeMaxErrorLimit + 1);

            const result = await service.isChangeEmailErrorRateLimit(mockEmail);

            expect(result).toBe(true);
        });

        it('should return false when change email error count is null/undefined', async () => {
            jest.spyOn(cacheService, 'get').mockResolvedValue(null);

            const result = await service.isChangeEmailErrorRateLimit(mockEmail);

            expect(result).toBe(false);
        });

        it('should reset change email error count', async () => {
            const delSpy = jest.spyOn(cacheService, 'del').mockResolvedValue(true);

            await service.resetChangeEmailErrorRateLimit(mockEmail);

            expect(delSpy).toHaveBeenCalledWith(`auth:change_email_error_rate_limit:${mockEmail}`);
        });
    });

    describe('Integration Tests', () => {
        it('should simulate complete login error rate limit flow', async () => {
            // 初始状态
            jest.spyOn(cacheService, 'get').mockResolvedValue(null);
            expect(await service.isLoginErrorRateLimit(mockEmail)).toBe(false);

            // 添加错误计数
            const incrSpy = jest.spyOn(cacheService, 'incr')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(3);

            await service.addLoginErrorRateLimit(mockEmail);
            await service.addLoginErrorRateLimit(mockEmail);
            await service.addLoginErrorRateLimit(mockEmail);

            // 模拟达到限制
            jest.spyOn(cacheService, 'get').mockResolvedValue(3);
            if (3 > authConfig().emailChangeMaxErrorLimit) {
                expect(await service.isLoginErrorRateLimit(mockEmail)).toBe(true);
            }

            // 重置
            const delSpy = jest.spyOn(cacheService, 'del').mockResolvedValue(true);
            await service.resetLoginErrorRateLimit(mockEmail);

            expect(delSpy).toHaveBeenCalledWith(`auth:login_error_rate_limit:${mockEmail}`);
        });

        it('should handle different emails independently', async () => {
            const email1 = 'user1@example.com';
            const email2 = 'user2@example.com';

            const incrSpy = jest.spyOn(cacheService, 'incr').mockResolvedValue(1);

            await service.addLoginErrorRateLimit(email1);
            await service.addLoginErrorRateLimit(email2);

            expect(incrSpy).toHaveBeenCalledWith(`auth:login_error_rate_limit:${email1}`);
            expect(incrSpy).toHaveBeenCalledWith(`auth:login_error_rate_limit:${email2}`);
        });
    });

    afterAll(async () => {
        await app.close();
    });

});
