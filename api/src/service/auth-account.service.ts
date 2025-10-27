import { AccountService } from "@/account/account.service";
import { AccountEntity } from "@/account/entities/account.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { DataSource, EntityManager, QueryRunner, Repository } from "typeorm";
import { EnhanceCacheService } from "./caches/enhance-cache.service";
import { BillingService } from "./billing/billing.service";
import { AccountSignUpDto } from "./dto/account.dto";
import { CreateAccountDto } from "@/account/account/dto/create-account.dto";
import { BadRequestGraphQLException, DatabaseGraphQLException } from "@/common/exceptions";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";
import { AccountIntegrateEntity } from "@/account/entities/account-integrate.entity";
import { plainToInstance } from "class-transformer";
import { throwIfDtoValidateFail } from "@/common/utils/validation";
import { TenantService } from "./tenant.service";
import { SystemService } from "@/monie/system.service";
import { TenantEntity, TenantStatus } from "@/account/entities/tenant.entity";
import { AccountRole, AccountStatus, MemberAction } from "@/account/account.enums";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { TenantAccountEntity } from "@/account/entities/tenant-account.entity";
import { EnumConverter, EnumUtils } from "@/common/utils/enums";
import { AccountNotLinkTenantError, CanNotOperateSelfError, InvalidActionError, MemberNotInTenantError, NoPermissionError, permissionMap, RoleAlreadyAssignedError } from "@/account/errors";

@Injectable()
export class AuthAccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        private readonly accountService: AccountService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly cacheService: EnhanceCacheService,
        private readonly billingService: BillingService,
        private readonly systemService: SystemService,
        private readonly dataSource: DataSource,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly tenantService: TenantService,
    ) { }

    async test() {
        const account = await this.accountRepository.findOne({ where: { id: 1 } });
        console.log('account', account);
        const accountSame = await this.accountService.getByUserName('admin');
        console.log('account', accountSame);
        const value = await this.cacheManager.get<string>('key');
        console.log('cahce value:', value);
        const redisClient = await this.cacheService.getRedisClient();
        // await redisClient.rPush('la', ['foo', 'bar']);
        console.log('client', await redisClient.lRange('la', 0, -1))
    }

    async isAccountFreezed(email: string): Promise<boolean> {
        if (this.systemService.billingEnabled && await this.billingService.isEmailInFreeze(email)) {
            return true;
        }
        return false;
    }

    @Transactional()
    async register(dto: AccountSignUpDto, isSetup = false, entityManager?: EntityManager) {
        const validateObj = plainToInstance(AccountSignUpDto, dto);
        const errors = await this.i18n.validate(validateObj);
        throwIfDtoValidateFail(errors);

        const workManager = entityManager ? entityManager : this.dataSource.manager;

        if (!this.systemService.allowRegister && !isSetup) {
            throw new BadRequestGraphQLException(this.i18n.t('account.ACCOUNT_NOT_FOUND'));
        }

        const createAccount: CreateAccountDto = {
            username: dto.name,
            email: dto.email,
            password: dto.password || '',
            status: dto.status,
            createdBy: 'SignUp',
            language: dto.language,
            theme: dto.theme,
        };
        const createdAccount = await this.accountService.create(createAccount, workManager);
        if (!createdAccount.id) {
            throw new DatabaseGraphQLException(this.i18n.t('system.CREATE_FAILED_ID_INVALID'));
        }

        let linkIntegrate: AccountIntegrateEntity | undefined = undefined;
        if (dto.openId) {
            linkIntegrate = await this.linkAccountIntegrate(dto.provider || '', dto.openId, createdAccount, workManager);
        }

        let tenant: TenantEntity | undefined = undefined;

        if (this.systemService.allowCreateWorkspace &&
            dto.createWorkspaceRequired
            // && 验证账号是否开通企业版
        ) {
            tenant = await this.tenantService.createTenant({ name: dto.name, createdBy: createAccount.createdBy }, isSetup, workManager);
            await this.tenantService.addAccountTenantMembership(createdAccount, tenant!, AccountRole.OWNER, workManager);
        }

        return { account: createdAccount, tenant, linkIntegrate }
    }

    async linkAccountIntegrate(provider: string, openId: string, account: AccountEntity, entityManager?: EntityManager): Promise<AccountIntegrateEntity> {
        const workManager = entityManager || this.dataSource.manager;

        const accountIntegrate = await workManager.findOne(AccountIntegrateEntity, {
            where: {
                accountId: account.id,
                provider: provider
            }
        });

        if (accountIntegrate) {
            accountIntegrate.openId = openId;
            accountIntegrate.encryptedToken = '';
            accountIntegrate.updatedAt = new Date();
            await workManager.save(AccountIntegrateEntity, accountIntegrate);
            return accountIntegrate;
        } else {
            const newAccountIntegrate = workManager.create(AccountIntegrateEntity, {
                accountId: account.id,
                provider: provider,
                openId: openId,
                encryptedToken: '',
                createdAt: new Date(),
            });
            await workManager.save(AccountIntegrateEntity, newAccountIntegrate);
            return newAccountIntegrate;
        }
    }

    async getAccountRole(account: AccountEntity, tenant: TenantEntity, entityManager?: EntityManager): Promise<AccountRole | null> {
        const workManager = entityManager || this.dataSource.manager;
        const tenantAccount = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: account.id },
            },
        });
        return EnumConverter.safeToEnum(AccountRole, tenantAccount?.role || '');
    }

    async checkOperatorPermission(tenant: TenantEntity, role: AccountRole, action: string): Promise<void> {
        this.validateAction(action);

        const allowedRoles = permissionMap[action];
        if (!role || !allowedRoles.includes(role)) {
            throw new NoPermissionError(action, tenant.name);
        }
    }

    private validateAction(action: string): void {
        if (!EnumUtils.isEnumValue(MemberAction, action)) {
            throw new InvalidActionError(action);
        }
    }

    @Transactional()
    async updateUserRole(
        tenant: TenantEntity,
        operator: AccountEntity,
        newRole: AccountRole,
        user: AccountEntity,
        entityManager?: EntityManager
    ): Promise<TenantAccountEntity> {
        const workManager = entityManager || this.dataSource.manager;

        // Check operator permission
        const role = await this.getAccountRole(operator, tenant, workManager);
        if (!role) {
            throw new MemberNotInTenantError(operator.email, tenant.name);
        }
        await this.checkOperatorPermission(tenant, role, MemberAction.UPDATE);

        // Get target's member ship
        const targetMemberJoin = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: user.id },
            },
        });

        if (!targetMemberJoin) {
            throw new MemberNotInTenantError(user.email, tenant.name);
        }

        // Check if role is already assigned
        if (targetMemberJoin.role == newRole) {
            throw new RoleAlreadyAssignedError(user.realName, newRole);
        }

        // Handle owern role transfer
        if (newRole == AccountRole.OWNER) {
            await this.tenantService.addAccountTenantMembership(user, tenant, newRole, entityManager);
        }

        // Update the role
        targetMemberJoin.role = newRole;
        return await workManager.save(TenantAccountEntity, targetMemberJoin);
    }

    async isOwner(account: AccountEntity, tenant: TenantEntity): Promise<boolean> {
        const targetMemberJoin = await this.dataSource.manager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: account.id },
            },
        });
        return targetMemberJoin?.role == AccountRole.OWNER;
    }

    async isMember(user: AccountEntity, tenant: TenantEntity, entityManager?: EntityManager): Promise<boolean> {
        const workManager = entityManager || this.dataSource.manager;
        return !!await workManager.count(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: user.id },
            }
        });
    }

    async removeMember(user: AccountEntity, tenant: TenantEntity, operator: AccountEntity, entityManager?: EntityManager): Promise<void> {
        if (user.id == operator.id) {
            throw new CanNotOperateSelfError();
        }
        const workManager = entityManager || this.dataSource.manager;

        const tenantAccount = await workManager
            .findOne(TenantAccountEntity, {
                where: {
                    tenant: { id: tenant.id },
                    account: { id: user.id },
                }
            });
        if (!tenantAccount) {
            throw new MemberNotInTenantError(user.email, tenant.name);
        }

        const role = await this.getAccountRole(operator, tenant, workManager);
        if (!role) {
            throw new MemberNotInTenantError(operator.email, tenant.name);
        }
        await this.checkOperatorPermission(tenant, role, MemberAction.REMOVE);

        await workManager.remove(tenantAccount);
    }

    @Transactional()
    async switchTenant(user: AccountEntity, tenantId: string, entityManager?: EntityManager): Promise<void> {
        if (!tenantId) {
            throw new BadRequestException('Tenant ID must be provided');
        }
        const workManager = entityManager || this.dataSource.manager;
        // Find the tenant membership
        const tenantAccount = await this.findAndValidateMembership(user.id, tenantId, workManager);
        // Reset current flag for all other tenants
        await this.resetCurrentTenants(user.id, tenantId, workManager);
        // Set new current flag
        await this.setCurrentTenant(user, tenantAccount, workManager);
    }

    async getCurrentTenant(accountId: number, entityManager?: EntityManager): Promise<{ tenant: TenantEntity; membership: TenantAccountEntity } | null> {
        const workManager = entityManager || this.dataSource.manager;
        const membership = await await workManager
            .createQueryBuilder(TenantAccountEntity, 'taj')
            .innerJoinAndSelect('taj.tenant', 'tenant')
            .where('taj.account_id = :accountId', { accountId })
            .andWhere('taj.current = :current', { current: true })
            .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
            .getOne();
        return membership ? { tenant: membership.tenant, membership } : null;
    }

    async findAndValidateMembership(accountId: number, tenantId: string, manager: EntityManager): Promise<TenantAccountEntity> {
        const tenantAccount = await manager
            .createQueryBuilder(TenantAccountEntity, 'taj')
            .innerJoinAndSelect('taj.tenant', 'tenant')
            .where('taj.account_id = :accountId', { accountId })
            .andWhere('taj.tenant_id = :tenantId', { tenantId })
            .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
            .getOne();
        if (!tenantAccount) {
            throw new AccountNotLinkTenantError(tenantId, await this.getAccountEmail(accountId, manager));
        }

        return tenantAccount;
    }

    async getAccountEmail(accountId: number, manager: EntityManager): Promise<string> {
        const account = await manager.findOne(AccountEntity, {
            where: {
                id: accountId
            }
        });
        return account?.email || 'unknown';
    }

    private async resetCurrentTenants(accountId: number, excludeTenantId: string, manager: EntityManager): Promise<void> {
        await manager
            .createQueryBuilder()
            .update(TenantAccountEntity)
            .set({ current: false })
            .where('account_id = :accountId', { accountId: accountId })
            .andWhere('tenant_id != :excludeTenantId', { excludeTenantId })
            .execute();
    }

    private async setCurrentTenant(account: AccountEntity, membership: TenantAccountEntity, manager: EntityManager): Promise<void> {
        membership.current = true;
        await manager.save(TenantAccountEntity, membership);
    }

    async getAvailableTenants(accountId: number, entityManager?: EntityManager): Promise<TenantEntity[]> {
        const workManager = entityManager || this.dataSource.manager;
        const memberships = await workManager
            .createQueryBuilder(TenantAccountEntity, 'taj')
            .innerJoinAndSelect('taj.tenant', 'tenant')
            .where('taj.account_id = :accountId', { accountId })
            .andWhere('tenant.status = :status', { status: TenantStatus.ACTIVE })
            .orderBy('taj.current', 'DESC')
            .addOrderBy('tenant.name', 'ASC')
            .getMany();
        return memberships.map(membership => membership.tenant);
    }

    async getTenantMembers(tenantId: string, entityManager?: EntityManager): Promise<AccountEntity[]> {
        const workManager = entityManager || this.dataSource.manager;
        const accounts = await workManager
            .createQueryBuilder(AccountEntity, 'acc')
            .leftJoinAndMapOne('account.tenant', TenantAccountEntity, 'taj', 'taj.account_id = acc.id AND taj.tenant_id = :tenantId', { tenantId })
            .andWhere('taj.id IS NOT NULL')
            .select(['acc'/*, 'taj.role as account_role', 'taj.current as current_tenant'*/]) // todo mapping role and current field
            .getMany();
        return accounts;
    }

}
