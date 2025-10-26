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
import { DataSource } from 'typeorm';
import { TenantAccountEntity } from '@/account/entities/tenant-account.entity';
import { AccountEntity } from '@/account/entities/account.entity';
import { AccountIntegrateEntity } from '@/account/entities/account-integrate.entity';

describe('AuthAccountService (e2e)', () => {
    let app: INestApplication<App>;
    let authAccountService: AuthAccountService;
    let tenantService: TenantService;
    let accountService: AccountService;
    let dataSource: DataSource;
    const testAccountEmail = 'test3@example.com';
    const testTenantId = '106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        authAccountService = app.get<AuthAccountService>(AuthAccountService);
        tenantService = app.get<TenantService>(TenantService);
        accountService = app.get<AccountService>(AccountService);
        dataSource = app.get<DataSource>(DataSource);
    });

    describe('AuthAccount Register', () => {
        it('should register a new account successfully', async () => {
            const dto: AccountSignUpDto = {
                email: 'test3@example.com',
                name: 'testuser3',
                password: 'password123',
                language: 'en-US',
                createWorkspaceRequired: true,
            };

            if (!await accountService.getByEmail(dto.email)) {
                const result = await authAccountService.register(dto, true);

                expect(result.account.id).toBeDefined();
                expect(result.tenant?.id).toBeDefined();
            }
        });

        it('should register a new account succesfully by open id', async () => {
            const dto: AccountSignUpDto = {
                email: 'test2@example.com',
                name: 'testuser2',
                password: 'password123',
                language: 'zh-Hans',
                createWorkspaceRequired: true,
                openId: 'openid-123',
                provider: 'opanai',
            };

            if (!await accountService.getByEmail(dto.email)) {
                const result = await authAccountService.register(dto, true);

                expect(result.account.id).toBeDefined();
                expect(result.tenant?.id).toBeDefined();
            }
        });

        it('should register and delete a new account succesfully by open id', async () => {
            const dto: AccountSignUpDto = {
                email: 'test5@example.com',
                name: 'testuser5',
                password: 'password123',
                language: 'zh-Hans',
                createWorkspaceRequired: true,
                openId: 'openid-456',
                provider: 'opanai',
            };

            await dataSource.transaction(async (manager) => {
                const result = await authAccountService.register(dto, true, manager);

                expect(result.account.id).toBeDefined();
                expect(result.tenant?.id).toBeDefined();

                manager.delete(AccountEntity, result.account.id);
                manager.delete(TenantEntity, result.tenant?.id);
                manager.createQueryBuilder().delete().from(TenantAccountEntity).where('tenant_id IN (:...ids)', { ids: [result.tenant?.id] }).execute();
                manager.createQueryBuilder().delete().from(AccountIntegrateEntity).where('account_id IN (:...ids)', { ids: [result.account.id] }).execute();
            });
        });

        it('should can change account owner', async () => {
            const accountId = 16;
            const tenantId = 'fd3499b8-b8b3-4d42-859e-355a29c0f275';

            const account = await accountService.getById(accountId);
            expect(account).toBeDefined();

            const tenant = await dataSource.manager.findOne(TenantEntity, {
                where: { id: tenantId }
            });
            expect(tenant).toBeDefined();

            const hasRole = await tenantService.hasRoles(tenant!, [AccountRole.OWNER]);
            expect(hasRole).toBeTruthy();

            const newAccountTenantJoin = await tenantService.addAccountTenantMembership(account!, tenant!, AccountRole.ADMIN);
            expect(newAccountTenantJoin).toBeDefined();

            expect(newAccountTenantJoin?.role == AccountRole.ADMIN);

            const tenantAccountCount = await dataSource.manager.count(TenantAccountEntity, {
                where: { tenant: { id: tenantId } },
            });
            expect(tenantAccountCount).toBe(1);

            // restore role
            await tenantService.addAccountTenantMembership(account!, tenant!, AccountRole.OWNER);
        });

        it('should throw error when creating duplicate owner', async () => {
            const tenantId = 'fd3499b8-b8b3-4d42-859e-355a29c0f275';

            await expect(
                dataSource.transaction(async (manager) => {
                    const tenant = await manager.findOne(TenantEntity, {
                        where: { id: tenantId }
                    });
                    expect(tenant).toBeDefined();

                    const dto: AccountSignUpDto = {
                        email: 'test@example.com',
                        name: 'testuser',
                        password: 'password123',
                        language: 'en-US',
                        createWorkspaceRequired: false, // 不创建tenant
                    };

                    const result = await authAccountService.register(dto, true, manager);

                    expect(result.account.id).toBeDefined();
                    const account = result.account;

                    // add owner to tenant where has an owner
                    await tenantService.addAccountTenantMembership(account!, tenant!, AccountRole.OWNER, manager)
                })
            ).rejects.toThrow('Tenant alrady has an owner');
        });

        it('should throw error for invalid role', async () => {
            const tenantId = 'fd3499b8-b8b3-4d42-859e-355a29c0f275';

            await expect(
                dataSource.transaction(async (manager) => {
                    const tenant = await manager.findOne(TenantEntity, {
                        where: { id: tenantId }
                    });
                    expect(tenant).toBeDefined();

                    const dto: AccountSignUpDto = {
                        email: 'test@example.com',
                        name: 'testuser',
                        password: 'password123',
                        language: 'en-US',
                        createWorkspaceRequired: false, // 不创建tenant
                    };

                    const result = await authAccountService.register(dto, true, manager);

                    expect(result.account.id).toBeDefined();
                    const account = result.account;

                    await tenantService.addAccountTenantMembership(account!, tenant!, "not-existent" as AccountRole, manager);
                })
            ).rejects.toThrow();
        });
    });

    describe('AuthAccount Check', () => {
        it('should get existing account role', async () => {
            const account = await accountService.getByEmail(testAccountEmail);
            expect(account).toBeDefined();

            const tenant = await tenantService.getTenant(testTenantId);
            expect(tenant).toBeDefined();

            const role = await authAccountService.getAccountRole(account!, tenant!);
            expect(role).toBe(AccountRole.OWNER);

            const anotherAccount = await accountService.getByEmail('test2@example.com');
            const notExistent = await authAccountService.getAccountRole(anotherAccount!, tenant!);
            expect(notExistent).toBeNull();
        });

        it('should have tenant data', async () => {
            expect(await tenantService.getTenantCount()).toBeGreaterThan(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
