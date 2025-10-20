import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { resolve } from "path";
import { AccountEntity } from "@/account/entities/account.entity";
import configuration from "@/config/configuration";
import { RoleEntity } from "@/account/entities/role.entity";
import { dbConfig } from "@/config/database.config";
import { DataSource, QueryRunner } from "typeorm";
import { RoleService } from "@/account/role.service";
import { CoreModule } from "@/core/core.module";
import { MenuEntity } from "@/account/entities/menu.entity";
import { MenuRoleEntity } from "@/account/entities/menu-role.entity";
import { ModulePermEntity } from "@/account/entities/module-perm.entity";
import { ModuleEntity } from "@/account/entities/module.entity";
import { DepEntity } from "@/account/entities/dep.entity";
import { PermEntity } from "@/account/entities/perm.entity";
import { AccountRoleService } from "@/account/account-role.service";
import { AccountService } from "@/account/account.service";

describe("Account Service (e2e)", () => {
    let accountService: AccountService;
    let accountRoleService: AccountRoleService;
    let dataSource: DataSource;
    let queryRunner: QueryRunner;

    beforeEach(async () => {
        await queryRunner.startTransaction(); // 开始事务
    });

    afterEach(async () => {
        await queryRunner.rollbackTransaction(); // 回滚事务
    });

    afterAll(async () => {
        await queryRunner.release();
    });

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                CoreModule,
                ConfigModule.forRoot({
                    envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`),
                    isGlobal: true,
                    load: [configuration]
                }),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: dbConfig,
                    inject: [ConfigService]
                }),
                TypeOrmModule.forFeature([
                    AccountEntity,
                    RoleEntity,
                    MenuEntity,
                    ModuleEntity,
                    MenuRoleEntity,
                    ModulePermEntity,
                    DepEntity,
                    MenuEntity,
                    PermEntity
                ]),
            ],
            providers: [
                {
                    provide: 'TEST_QUERY_RUNNER',
                    useFactory: (dataSource: DataSource) => {
                        const queryRunner = dataSource.createQueryRunner();
                        queryRunner.connect(); // 连接数据库
                        return queryRunner;
                    },
                    inject: [DataSource]
                },
                {
                    provide: getRepositoryToken(AccountEntity),
                    useFactory: (queryRunner: QueryRunner) => {
                        return queryRunner.manager.getRepository(AccountEntity);
                    },
                    inject: ['TEST_QUERY_RUNNER']
                },
                {
                    provide: getRepositoryToken(RoleEntity),
                    useFactory: (queryRunner: QueryRunner) => {
                        return queryRunner.manager.getRepository(RoleEntity);
                    },
                    inject: ['TEST_QUERY_RUNNER']
                },
                ConfigService,
                AccountService,
                AccountRoleService,
                RoleService,
            ],
        }).compile();

        accountService = module.get<AccountService>(AccountService);
        accountRoleService = module.get<AccountRoleService>(AccountRoleService);
        dataSource = module.get<DataSource>(DataSource);
        queryRunner = module.get<QueryRunner>('TEST_QUERY_RUNNER');
    });

    it("should create an account with roles", async () => {
        console.log("Creating account with roles...");
        const roleRepository = queryRunner.manager.getRepository(RoleEntity);
        const role = new RoleEntity();
        role.name = 'admin test';
        role.key = 'admintest';
        role.status = 0; // 0 for active
        role.parent = '';
        role.operate = {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
        };
        const role2 = new RoleEntity();
        role2.name = 'user test';
        role2.key = 'usertest';
        role2.status = 0; // 0 for active
        role2.parent = '';
        role2.operate = {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
        };

        await roleRepository.save(role);
        await roleRepository.save(role2);

        // console.log('Role created: ', role.id, role2.id);

        const accountData = {
            username: 'alex test',
            password: '123456',
            realName: 'alex xu',
            email: '',
            mobile: '',
            status: 0,
            roles: [role.id, role2.id], // Assuming roles with IDs 1 and 2
            createdAt: new Date(),
            createdBy: 'system',
            updatedAt: new Date(),
            updatedBy: 'system',
        };

        const account = await accountService.create(accountData);
        expect(account).toBeDefined();
        expect(account.username).toBe('alex test');
        expect(account.roles.length).toBe(2);
        // console.log("Account created successfully", account.id);
    });

    it("should get a list of accounts", async () => {
        console.log("Fetching account list...");
        const accounts = await accountService.query({
            id: 1,
            username: 'aaa',
            email: 'qq.com',
            page: 1,
            limit: 20,
        });
        expect(accounts.data).toBeDefined();
        expect(accounts.total).toBeDefined();
        // console.log("Accounts fetched successfully", accounts.data);
    });

    it("should get account roles", async () => {
        const roleRepository = queryRunner.manager.getRepository(RoleEntity);
        const role2 = new RoleEntity();
        role2.name = 'user test';
        role2.key = 'usertest';
        role2.status = 0; // 0 for active
        role2.parent = '';
        role2.operate = {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
        };
        await roleRepository.save(role2);
        const accountData = {
            username: 'alex test',
            password: '123456',
            realName: 'alex xu',
            email: '',
            mobile: '',
            status: 0,
            roles: [role2.id],
            createdAt: new Date(),
            createdBy: 'system',
            updatedAt: new Date(),
            updatedBy: 'system',
        };
        const account = await accountService.create(accountData);
        expect(account).toBeDefined();
        expect(account.username).toBe('alex test');
        expect(account.roles.length).toBe(1);

        const roles = await accountRoleService.getRoles(account);
        expect(roles.length).toBe(1);
        // console.log("get account roles", roles);
    });

    it('should assign account roles', async () => {
        const roleRepository = queryRunner.manager.getRepository(RoleEntity);
        const accountRepository = queryRunner.manager.getRepository(AccountEntity);
        const role2 = new RoleEntity();
        role2.name = 'user test';
        role2.key = 'usertest';
        role2.status = 0; // 0 for active
        role2.parent = '';
        role2.operate = {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
        };
        await roleRepository.save(role2);
        expect(role2.id).toBeDefined();
        const accountData = {
            username: 'alex test',
            password: '123456',
            realName: 'alex xu',
            email: '',
            mobile: '',
            status: 0,
            createdAt: new Date(),
            createdBy: 'system',
            updatedAt: new Date(),
            updatedBy: 'system',
        };
        const account = await accountService.create(accountData);
        expect(account).toBeDefined();

        const assignRole = await accountRoleService.assignRoles(account.id, [role2.id]);
        expect(assignRole).toBeTruthy();

        // console.log("account assign roles", assignRole);

        const role = new RoleEntity();
        role.name = 'admin test';
        role.key = 'admintest';
        role.status = 0; // 0 for active
        role.parent = '';
        role.operate = {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
        };
        await roleRepository.save(role);
        expect(role.id).toBeDefined();
        const appendRole = await accountRoleService.appendRoles(account.id, role.id);
        expect(appendRole).toBeTruthy();

        const accountNew = await accountRepository.findOne({
            where: { id: account.id },
            relations: { roles: true }
        });
        expect(accountNew).toBeDefined();
        expect(accountNew?.roles.length).toBe(2);
        // console.log("account append roles", accountNew);
    });
});