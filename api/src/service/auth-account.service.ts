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
import { TenantEntity } from "@/account/entities/tenant.entity";
import { AccountRole } from "@/account/account.enums";
import { Transactional } from "@/common/decorators/transaction.decorator";

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
}
