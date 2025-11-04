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
import { EmailRateLimiterService, EmailRateLimitOptions, EmailRateLimitType } from "./libs/rate-limiter/email-rate-limiter.service";
import { EmailLanguage } from "@/mail/mail-i18n.service";
import { defaultSendResetPasswordEmailParams, SendResetPasswordEmailParams } from "./interfaces/account.interface";
import { AccountChangeEmailRateLimitError, AccountDeletionRateLimitError, AccountResetPasswordRateLimitError, EmailCodeLoginRateLimitError } from "./exceptions/rate-limiter.error";
import { TOKEN_TYPES, TokenManagerService } from "./libs/token-manager.service";
import { MailService } from "@/mail/mail.service";
import { MonieConfig } from "@/monie/monie.config";
import { InvalidEmailError, InvalidTokenError, VerifyCodeError } from "./exceptions/token.error";
import { EmailInFreezeError } from "./exceptions/account.error";
import { GlobalLogger } from "@/logger/logger.service";

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
        private readonly emailRateLimiter: EmailRateLimiterService,
        private readonly tokenManagerService: TokenManagerService,
        private readonly mailService: MailService,
        private readonly monieConfig: MonieConfig,
        private readonly logger: GlobalLogger,
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

    // 可以不用code，直接生成链接重置，因为邮件模版没有用code
    async sendResetPasswordEmail({
        email,
        account,
        language = defaultSendResetPasswordEmailParams.language!
    }: SendResetPasswordEmailParams) {
        const accountEmail = account?.email || email || '';
        if (!accountEmail) {
            throw new BadRequestException(this.i18n.t('account.EMAIL_NOT_EMPTY'));
        }

        const isRateLimited = await this.emailRateLimiter.isRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['reset_password']);
        if (isRateLimited) {
            throw AccountResetPasswordRateLimitError.create(this.i18n);
        }

        // generate code token
        const { code, token } = await this.generateResetPasswordToken(email || '', account);
        // send email
        await this.mailService.queue.sendResetPassword({
            to: accountEmail,
            resetUrl: '', // todo
            expiryMinutes: this.monieConfig.resetPasswordTokenExpiryMinutes(),
            language,
        });

        await this.emailRateLimiter.incrementRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['reset_password']);
        return token;
    }

    async sendAccountDeletionEmail(account: AccountEntity, language: EmailLanguage): Promise<string> {
        const accountEmail = account?.email;
        if (!accountEmail) {
            throw new BadRequestException(this.i18n.t('account.EMAIL_NOT_EMPTY'));
        }
        const isRateLimited = await this.emailRateLimiter.isRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['email_code_account_deletion']);

        if (isRateLimited) {
            throw AccountDeletionRateLimitError.create(this.i18n);
        }

        // generate code token
        const { code, token } = await this.generateAccountDeletionToken(accountEmail);

        await this.mailService.queue.sendAccountDeletion({
            to: accountEmail || '',
            verificationCode: code,
            expiryMinutes: this.monieConfig.accountDeletionTokenExpiryMinutes(),
            language
        });

        await this.emailRateLimiter.incrementRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['email_code_account_deletion']);
        return token;
    }

    async sendChangeEmailVerification(account: AccountEntity, newEmail: string, language: EmailLanguage): Promise<string> {
        const accountEmail = account?.email;
        if (!accountEmail) {
            throw new BadRequestException(this.i18n.t('account.EMAIL_NOT_EMPTY'));
        }
        language = language || EmailLanguage.ZH_HANS;
        const isRateLimited = await this.emailRateLimiter.isRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['change_email']);
        if (isRateLimited) {
            throw AccountChangeEmailRateLimitError.create(this.i18n);
        }

        // generate code
        const code = await this.generateChangeEmailCode();
        const token = await this.tokenManagerService.generateToken(TOKEN_TYPES.CHANGE_EMAIL, undefined, accountEmail, { code });

        // send email
        await this.mailService.queue.sendChangeEmailOld({
            to: accountEmail,
            verificationCode: code,
            language,
            newEmail,
            expiryMinutes: this.monieConfig.changeEmailTokenExpiryMinutes(),
            oldEmail: accountEmail,
        });
        await this.emailRateLimiter.incrementRateLimited(accountEmail, EMAIL_RATE_LIMITER_CONFIGS['change_email']);
        return token;
    }

    async sendEmailCodeLogin(email: string, language?: EmailLanguage, location?: string, deviceInfo?: string): Promise<string> {
        language = language || EmailLanguage.ZH_HANS;
        const isRateLimited = await this.emailRateLimiter.isRateLimited(email, EMAIL_RATE_LIMITER_CONFIGS['email_code_login']);
        if (isRateLimited) {
            throw EmailCodeLoginRateLimitError.create(this.i18n);
        }

        // generate code
        const code = await this.generateEmailLoginCode();
        const token = await this.tokenManagerService.generateToken(TOKEN_TYPES.EMAIL_VERIFICATION, undefined, email, { code });

        // send email
        await this.mailService.queue.sendEmailCodeLogin({
            to: email,
            language,
            verificationCode: code,
            expiryMinutes: this.monieConfig.emailCodeLoginExpiryMinutes(),
            userEmail: email,
            requestTime: new Date().toLocaleString(language),
            location,
            deviceInfo
        });

        await this.emailRateLimiter.incrementRateLimited(email, EMAIL_RATE_LIMITER_CONFIGS['email_code_login']);
        return token;
    }

    async validateEmailCodeLogin(email: string, token: string, code: string, entityManager?: EntityManager): Promise<AccountEntity> {
        if (email == "" || token == "" || code == "") {
            throw new BadRequestException('Email and token and code cannot be empty');
        }

        const tokenData = await this.tokenManagerService.validateToken(token, TOKEN_TYPES.EMAIL_VERIFICATION);
        if (!tokenData) {
            throw InvalidTokenError.create(this.i18n);
        }
        if (tokenData.email != email) {
            throw InvalidEmailError.create(this.i18n);
        }
        if (tokenData.code != code) {
            throw VerifyCodeError.create(this.i18n);
        }

        await this.tokenManagerService.removeToken(token, TOKEN_TYPES.EMAIL_VERIFICATION);
        const account = await this.accountService.getByEmail(email);
        if (!account) {
            const dto: AccountSignUpDto = {
                email,
                name: email,
                createWorkspaceRequired: false
            }
            const accountNew = await this.register(dto);
            return accountNew.account;
        } else {
            if (await this.isAccountFreezed(email)) {
                throw EmailInFreezeError.create(this.i18n);
            }
            const workEntity = entityManager || this.dataSource.manager;
            const tenant = await this.getCurrentTenant(account.id, workEntity);
            if (!tenant?.tenant) {
                await this.createTenantForNewAccount(account);
            }
            return account;
        }
    }

    async createTenantForNewAccount(account: AccountEntity, entityManager?: EntityManager): Promise<void> {
        const workManager = entityManager || this.dataSource.manager;
        try {
            await this.tenantService.createDefaultTenantIfNotExists(account, undefined, false, workManager);
        } catch (error) {
            this.logger.log(`createTenantForNewAccount ${account.email} error: ${error.message}`);
        }
    }

    private async generateResetPasswordToken(email: string, account?: AccountEntity): Promise<{ code: string; token: string; }> {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const token = await this.tokenManagerService.generateToken(TOKEN_TYPES.RESET_PASSWORD, account, email, { code });

        return { code, token };
    }

    private async generateEmailLoginCode(): Promise<string> {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    private async generateChangeEmailCode(): Promise<string> {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    private async generateAccountDeletionToken(email: string): Promise<{ code: string; token: string; }> {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const token = await this.tokenManagerService.generateToken(TOKEN_TYPES.ACCOUNT_DELETION, undefined, email, { code })
        return { code, token };
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

export type EMAIL_RATE_CONFIG_KEYS = 'reset_password' | 'change_email' | 'email_code_login' | 'email_code_account_deletion';

export const EMAIL_RATE_LIMITER_CONFIGS: Record<EMAIL_RATE_CONFIG_KEYS, EmailRateLimitOptions> = {
    'reset_password': {
        type: EmailRateLimitType.RESET_PASSWORD,
        maxAttempts: 1,
        timeWindow: 60,
    },
    'change_email': {
        type: EmailRateLimitType.CHANGE_EMAIL,
        maxAttempts: 1,
        timeWindow: 60,
    },
    'email_code_login': {
        type: EmailRateLimitType.EMAIL_CODE_LOGIN,
        maxAttempts: 1,
        timeWindow: 60,
    },
    'email_code_account_deletion': {
        type: EmailRateLimitType.EMAIL_CODE_ACCOUNT_DELETION,
        maxAttempts: 1,
        timeWindow: 60,
    },
}
