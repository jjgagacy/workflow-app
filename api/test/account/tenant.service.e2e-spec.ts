import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { AccountSignUpDto } from '@/service/dto/account.dto';
import { TenantService } from '@/service/tenant.service';
import { AccountRole } from '@/account/account.enums';
import { AccountService } from '@/account/account.service';
import { TenantEntity } from '@/account/entities/tenant.entity';
import { DataSource, EntityManager } from 'typeorm';
import { TenantAccountEntity } from '@/account/entities/tenant-account.entity';
import { AccountEntity } from '@/account/entities/account.entity';
import { AccountIntegrateEntity } from '@/account/entities/account-integrate.entity';

describe('TenantService (e2e)', () => {
    let app: INestApplication<App>;
    let tenantService: TenantService;
    let accountService: AccountService;
    let dataSource: DataSource;
    let account: AccountEntity;
    let authAccountService: AuthAccountService;
    let entityManager: EntityManager;
    let tenant: TenantEntity | undefined;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        tenantService = app.get<TenantService>(TenantService);
        accountService = app.get<AccountService>(AccountService);
        authAccountService = app.get<AuthAccountService>(AuthAccountService);
        dataSource = app.get<DataSource>(DataSource);
        entityManager = dataSource.manager;
    });

    beforeEach(async () => {
        const dto: AccountSignUpDto = {
            email: 'test7@example.com',
            name: 'testuser7',
            password: 'password123',
            language: 'en-US',
            createWorkspaceRequired: false,
        };

        const reg = await authAccountService.register(dto, false, entityManager);
        account = reg.account;
        tenant = reg.tenant;
    });

    describe('create tenant', () => {
        it('should create tenant if not exists successfully', async () => {
            expect(account).toBeDefined();

            await tenantService.createDefaultTenantIfNotExists(account, 'testNS', false, entityManager);

            const curr = await authAccountService.getCurrentTenant(account.id);
            expect(curr?.tenant).toBeDefined();
            tenant = curr?.tenant;
        });
    });

    afterEach(async () => {
        await dataSource.transaction(async (manager) => {
            manager.delete(AccountEntity, account.id);
            if (tenant) manager.delete(TenantEntity, tenant.id);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
