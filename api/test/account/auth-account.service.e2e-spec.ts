import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { AccountSignUpDto } from '@/service/dto/account.dto';

describe('AuthAccountService (e2e)', () => {
    let app: INestApplication<App>;
    let authAccountService: AuthAccountService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        authAccountService = app.get<AuthAccountService>(AuthAccountService);
    });

    describe('register function', () => {
        it('should register a new account successfully', async () => {
            const dto: AccountSignUpDto = {
                email: 'test3@example.com',
                name: 'testuser3',
                password: 'password123',
                language: 'en-US',
                createWorkspaceRequired: true,
            };

            const result = await authAccountService.register(dto, true);

            expect(result.account.id).toBeDefined();
            expect(result.tenant?.id).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
