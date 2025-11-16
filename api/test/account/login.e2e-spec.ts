import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { TokenManagerService } from '@/service/libs/token-manager.service';
import { DataSource } from 'typeorm';
import { AccountService } from '@/account/account.service';
import { TenantAccountEntity } from '@/account/entities/tenant-account.entity';
import { TenantEntity, TenantStatus } from '@/account/entities/tenant.entity';
import { AccountEntity } from '@/account/entities/account.entity';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';

describe('Login (e2e)', () => {
    let app: INestApplication<App>;
    let authAccountService: AuthAccountService;
    let tokenManagerService: TokenManagerService;
    let dataSource: DataSource;
    let accountService: AccountService;
    let cacheService: EnhanceCacheService;
    const testEmail = '511268609@qq.com';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        authAccountService = app.get<AuthAccountService>(AuthAccountService);
        tokenManagerService = app.get<TokenManagerService>(TokenManagerService);
        accountService = app.get<AccountService>(AccountService);
        cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
        dataSource = app.get<DataSource>(DataSource);
        // 触发连接redis
        await cacheService.get('foo');
    });

    describe('EmailCodeLogin', () => {
        beforeEach(async () => {
            await dataSource.transaction(async (manager) => {
                const account = await accountService.getByEmail(testEmail);
                if (account) {
                    const memberships = await manager
                        .createQueryBuilder(TenantAccountEntity, 'taj')
                        .innerJoinAndSelect('taj.tenant', 'tenant')
                        .where('taj.account_id = :accountId', { accountId: account.id })
                        .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
                        .orderBy('taj.current', 'DESC')
                        .addOrderBy('tenant.name', 'ASC')
                        .getMany();

                    memberships.map(membership => {
                        manager.delete(TenantAccountEntity, { id: membership.id })
                        if (membership.tenant) {
                            manager.delete(TenantEntity, { id: membership.tenant.id });
                        }
                    });
                    manager.delete(AccountEntity, { id: account.id });
                }
            });
        });

        it('should login by send email and register new account and tenent', async () => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const token = await authAccountService.sendEmailCodeLogin(testEmail, undefined, undefined, undefined, code);
            expect(token).toBeDefined();

            const account = await authAccountService.validateEmailCodeLogin(testEmail, token, code, 'zh-Hans');
            expect(account).toBeDefined();
            expect(account.id).toBeDefined();

            const current = await authAccountService.getCurrentTenant(account.id);
            expect(current?.tenant).toBeDefined();
            expect(current?.tenant.id).toBeDefined();
            expect(current?.tenant.status).toEqual(TenantStatus.ACTIVE);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
