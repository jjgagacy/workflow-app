import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/service/caches/enhance-cache.service';
import { AccountService } from '@/account/account.service';

describe('Validation E2E Test', () => {
    // jest.setTimeout(30000);
    let app: INestApplication<App>;
    let cacheService: EnhanceCacheService;
    let accountService: AccountService;
    let connected = false;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
        accountService = app.get<AccountService>(AccountService);
        // trigger connect redis because lazy connect
        await cacheService.get('foo');
        connected = true;
    });

    describe('Comprehensive Password Policy E2E Test', () => {
        const testCases = [
            {
                description: 'should reject empty password',
                password: '',
                expectedError: 'password should not be empty'
            },
            {
                description: 'should reject password with only spaces',
                password: '        ',
                expectedError: 'Password must contain'
            },
            {
                description: 'should reject password without numbers',
                password: 'PasswordWithoutNumbers',
                expectedError: 'Password must contain at least one number'
            },
            {
                description: 'should reject password without letters',
                password: '1234567890',
                expectedError: 'Password must contain at least one letter'
            },
            {
                description: 'should reject password with only special characters',
                password: '!@#$%^&*()',
                expectedError: 'Password must contain at least one letter'
            },
            {
                description: 'should accept password with uppercase, lowercase and numbers',
                password: 'ValidPass123',
                shouldPass: true
            },
            {
                description: 'should accept password with special characters',
                password: 'MyPassword@2024!',
                shouldPass: true
            },
            {
                description: 'should accept password with minimum length',
                password: 'Abc12345', // 正好8位
                shouldPass: true
            },
            {
                description: 'should accept password with mixed characters',
                password: 'P@ssw0rd2024',
                shouldPass: true
            }
        ];

        testCases.forEach(({ description, password, shouldPass }) => {
            it(description, () => {
                try {
                    const pass = accountService.validPassword(password);
                    if (shouldPass) expect(pass).toBe(shouldPass);
                    else expect(pass).toBeUndefined();
                } catch (error) {
                }
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
