import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { EmailRateLimiterService, EmailRateLimitOptions, EmailRateLimitType } from '@/service/libs/rate-limiter/email-rate-limiter.service';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { TOKEN_TYPES, TokenManagerService } from '@/service/libs/token-manager.service';

describe('TokenManager (e2e)', () => {
    let app: INestApplication<App>;
    let authAccountService: AuthAccountService;
    let rateLimiterService: EmailRateLimiterService;
    let tokenManagerService: TokenManagerService;
    const testAccountId = 15;
    const testAccountEmail = 'test3@example.com';
    const testAccount = { id: 1, email: testAccountEmail };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        authAccountService = app.get<AuthAccountService>(AuthAccountService);
        tokenManagerService = app.get<TokenManagerService>(TokenManagerService);
        rateLimiterService = app.get<EmailRateLimiterService>(EmailRateLimiterService);
    });

    describe('Token Generation', () => {
        it('should generate reset password token with account', async () => {
            const token = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);

            // validate token data
            const tokenData = await tokenManagerService.getTokenData(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeDefined();
            expect(tokenData?.accountId).toBe(testAccount.id);
            expect(tokenData?.email).toBe(testAccount.email);
            expect(tokenData?.tokenType).toBe(TOKEN_TYPES.RESET_PASSWORD);
        });

        it('should generate token with email only', async () => {
            const token = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                undefined,
                testAccountEmail,
            );

            expect(token).toBeDefined();

            const tokenData = await tokenManagerService.getTokenData(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeDefined();
            expect(tokenData?.accountId).toBeUndefined();
            expect(tokenData?.email).toBe(testAccountEmail);
            expect(tokenData?.tokenType).toBe(TOKEN_TYPES.RESET_PASSWORD);
        });

        it('should generate token with additional data', async () => {
            const additionalData = {
                ip: '192.168.1.1',
                user_agent: 'test-agent',
                custom_field: 'custom_value'
            };

            const token = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
                undefined,
                additionalData,
            );

            const tokenData = await tokenManagerService.getTokenData(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData?.ip).toBe(additionalData.ip);
            expect(tokenData?.user_agent).toBe(additionalData.user_agent);
            expect(tokenData?.custom_field).toBe(additionalData.custom_field);
        });

        it('should throw error when neither account nor email provided', async () => {
            await expect(
                tokenManagerService.generateToken(TOKEN_TYPES.RESET_PASSWORD)
            ).rejects.toThrow('Account or email must be provided');
        });

        it('should generate different token for different token types', async () => {
            const resetToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );
            const deletionToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.ACCOUNT_DELETION,
                testAccount,
            );

            expect(resetToken).not.toBe(deletionToken);
            const resetData = await tokenManagerService.getTokenData(resetToken, TOKEN_TYPES.RESET_PASSWORD);
            const deletionData = await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION);

            expect(resetData?.tokenType).toBe(TOKEN_TYPES.RESET_PASSWORD);
            expect(deletionData?.tokenType).toBe(TOKEN_TYPES.ACCOUNT_DELETION);
        });
    });

    describe('Token Validation', () => {
        it('should validate valid token', async () => {
            const token = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );
            const tokenData = await tokenManagerService.validateToken(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeDefined();
            expect(tokenData?.accountId).toBe(testAccount.id);
            expect(tokenData?.email).toBe(testAccount.email);
        });

        it('should return null for invalid token', async () => {
            const tokenData = await tokenManagerService.validateToken('invalid-token', TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeNull();
        });
    });

    describe('Token Revocation', () => {
        it('should revoke token successfully', async () => {
            const token = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );
            let tokenData = await tokenManagerService.getTokenData(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeDefined();

            await tokenManagerService.removeToken(token, TOKEN_TYPES.RESET_PASSWORD);

            tokenData = await tokenManagerService.getTokenData(token, TOKEN_TYPES.RESET_PASSWORD);
            expect(tokenData).toBeNull();
        });
    });

    describe('Token Management', () => {
        it('shoud revoke old token when generating new one for same account', async () => {
            const firstToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );
            let firstTokenData = await tokenManagerService.getTokenData(firstToken, TOKEN_TYPES.RESET_PASSWORD);
            expect(firstTokenData).toBeDefined();

            const secondToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );
            expect(secondToken).toBeDefined();
            expect(secondToken).not.toBe(firstToken);

            // validate first token revoked
            firstTokenData = await tokenManagerService.getTokenData(firstToken, TOKEN_TYPES.RESET_PASSWORD);
            expect(firstTokenData).toBeNull();

            const secondTokenData = await tokenManagerService.getTokenData(secondToken, TOKEN_TYPES.RESET_PASSWORD);
            expect(secondTokenData).toBeDefined();
        });

        it('should handle multiple token types for same account independently', async () => {
            const resetToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );

            const deletionToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.ACCOUNT_DELETION,
                testAccount,
            );

            const resetData = await tokenManagerService.getTokenData(resetToken, TOKEN_TYPES.RESET_PASSWORD);
            const deletionData = await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION);

            expect(resetData).toBeDefined();
            expect(deletionData).toBeDefined();

            const newResetToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount,
            );

            const newResetData = await tokenManagerService.getTokenData(newResetToken, TOKEN_TYPES.RESET_PASSWORD);
            const deletionDataAfter = await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION);
            expect(newResetData).toBeDefined();
            expect(deletionDataAfter).toBeDefined();
        });
    });

    describe('Bulk Operations', () => {
        it('should revoke all tokens for account', async () => {
            const resetToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount
            );

            const deletionToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.ACCOUNT_DELETION,
                testAccount
            );

            const verificationToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.EMAIL_VERIFICATION,
                testAccount
            );

            // 验证所有token都存在
            expect(await tokenManagerService.getTokenData(resetToken, TOKEN_TYPES.RESET_PASSWORD)).toBeDefined();
            expect(await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION)).toBeDefined();
            expect(await tokenManagerService.getTokenData(verificationToken, TOKEN_TYPES.EMAIL_VERIFICATION)).toBeDefined();

            // 撤销所有token
            await tokenManagerService.removeTokensForAccount(testAccount.id);

            // 验证所有token都被撤销
            expect(await tokenManagerService.getTokenData(resetToken, TOKEN_TYPES.RESET_PASSWORD)).toBeNull();
            expect(await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION)).toBeNull();
            expect(await tokenManagerService.getTokenData(verificationToken, TOKEN_TYPES.EMAIL_VERIFICATION)).toBeNull();
        });

        it('should revoke specific token type for account', async () => {
            const resetToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.RESET_PASSWORD,
                testAccount
            );

            const deletionToken = await tokenManagerService.generateToken(
                TOKEN_TYPES.ACCOUNT_DELETION,
                testAccount
            );

            // 只撤销reset password token
            await tokenManagerService.removeTokensForAccount(testAccount.id, TOKEN_TYPES.RESET_PASSWORD);

            // 验证reset token被撤销，deletion token仍然有效
            expect(await tokenManagerService.getTokenData(resetToken, TOKEN_TYPES.RESET_PASSWORD)).toBeNull();
            expect(await tokenManagerService.getTokenData(deletionToken, TOKEN_TYPES.ACCOUNT_DELETION)).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
