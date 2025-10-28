import { I18nTranslations } from "@/generated/i18n.generated";
import { ConflictException, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CreateTenantDto } from "./dto/tenant.dto";
import { DataSource, EntityManager, In } from "typeorm";
import { plainToInstance } from "class-transformer";
import { throwIfDtoValidateFail } from "@/common/utils/validation";
import { SystemService } from "@/monie/system.service";
import { BadRequestGraphQLException } from "@/common/exceptions";
import { TenantEntity } from "@/account/entities/tenant.entity";
import { AccountRole } from "@/account/account.enums";
import { AccountEntity } from "@/account/entities/account.entity";
import { EnumUtils, getEnumKeySafe } from "@/common/utils/enums";
import { TenantAccountEntity } from "@/account/entities/tenant-account.entity";
import { Transactional } from "@/common/decorators/transaction.decorator";

@Injectable()
export class TenantService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly systemService: SystemService,
    ) { }

    async createTenant(dto: CreateTenantDto, isSetup = false, entityManager?: EntityManager) {
        const validateObj = plainToInstance(CreateTenantDto, dto);
        const errors = await this.i18n.validate(validateObj);
        throwIfDtoValidateFail(errors);

        if (!this.systemService.allowCreateWorkspace && !isSetup) {
            throw new BadRequestGraphQLException(this.i18n.t('tenant.WORKSPACE_CREATE_NOT_ALLOWD'));
        }
        const workManager = entityManager ? entityManager : this.dataSource.manager;
        const tenant = workManager.create(TenantEntity, {
            name: dto.name,
            operate: {
                createdBy: dto.createdBy
            }
        });
        // todo 密钥等其他信息
        return await workManager.save(tenant);
    }

    async createDefaultTenantIfNotExists(account: AccountEntity, isSetup = false, entityManager?: EntityManager): Promise<void> {
        const workManager = entityManager ? entityManager : this.dataSource.manager;
        const tenant = await workManager.findOne(TenantAccountEntity, {
            where: { account: { id: account.id } },
            order: { id: 'ASC' },
        });

        if (tenant) return

        if (!this.systemService.allowCreateWorkspace && !isSetup) {
            throw new BadRequestGraphQLException(this.i18n.t('tenant.WORKSPACE_CREATE_NOT_ALLOWD'));
        }

        // todo feature get



    }

    @Transactional()
    async addAccountTenantMembership(account: AccountEntity, tenant: TenantEntity, role: AccountRole, entityManager?: EntityManager): Promise<TenantAccountEntity | null> {
        if (!EnumUtils.safeValidateEnumValues(AccountRole, [role])) {
            throw new Error('Role must be AccountRole');
        }

        const workManager = entityManager ? entityManager : this.dataSource.manager;
        if (role == AccountRole.OWNER) {
            if (await this.hasRoles(tenant, [AccountRole.OWNER], entityManager)) {
                throw new BadRequestGraphQLException('Tenant alrady has an owner');
            }
        }

        const result = await workManager.upsert(TenantAccountEntity, {
            tenant: { id: tenant.id },
            account: { id: account.id },
            role: role
        }, ['tenant', 'account']);

        if (!result || !result.identifiers || result.identifiers.length === 0) {
            throw new Error('Failed to upsert result');
        }

        return workManager.findOne(TenantAccountEntity, {
            where: { tenant: { id: tenant.id }, account: { id: account.id } }
        });
    }

    async hasRoles(tenant: TenantEntity, roles: AccountRole[], entityManager?: EntityManager): Promise<boolean> {
        if (!EnumUtils.safeValidateEnumValues(AccountRole, roles)) {
            throw new Error('all roles must be AccountRole');
        }
        const workManager = entityManager ? entityManager : this.dataSource.manager;
        const joinRecord = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                role: In(roles),
            }
        });
        return joinRecord != null;
    }

    async getTenant(tenantId: string): Promise<TenantEntity | null> {
        return await this.dataSource.manager.findOne(TenantEntity, {
            where: {
                id: tenantId
            }
        });
    }

    async getAccountRole(tenant: TenantEntity, account: AccountEntity, entityManager?: EntityManager): Promise<string | null> {
        const workManager = entityManager ? entityManager : this.dataSource.manager;

        const joinRecord = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: account.id },
            },
            select: ['role'],
        });

        return joinRecord?.role || null;
    }

    async removeUserFromTenant(tenant: TenantEntity, account: AccountEntity, entityManager?: EntityManager): Promise<void> {
        const workManager = entityManager ? entityManager : this.dataSource.manager;

        await workManager.delete(TenantAccountEntity, {
            tenant: { id: tenant.id },
            account: { id: account.id },
        });
    }

    async getTenantUsers(tenant: TenantEntity, entityManager?: EntityManager): Promise<TenantAccountEntity[]> {
        const workManager = entityManager ? entityManager : this.dataSource.manager;

        return await workManager.find(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
            },
            relations: ['account'],
        });
    }

    // Transfer ownership to another member
    @Transactional()
    async transferOwnership(
        tenant: TenantEntity,
        fromAccount: AccountEntity,
        toAccount: AccountEntity,
        entityManager?: EntityManager
    ): Promise<void> {
        const workManager = entityManager || this.dataSource.manager;

        const fromMember = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: fromAccount.id },
                role: AccountRole.OWNER,
            },
        });

        if (!fromMember) {
            throw new ConflictException('Only owner can transfer ownership');
        }

        // 更新原owner为admin
        fromMember.role = AccountRole.ADMIN;
        await workManager.save(TenantAccountEntity, fromMember);

        // 设置新用户为 OWNER
        await this.addAccountTenantMembership(toAccount, tenant, AccountRole.OWNER, workManager);
    }

    async getTenantCount(): Promise<number> {
        return this.dataSource.manager.count(TenantEntity);
    }

    async getOwner(tenant: TenantEntity, entityManager?: EntityManager): Promise<AccountEntity | null> {
        const workManager = entityManager || this.dataSource.manager;
        const owner = await workManager
            .createQueryBuilder(TenantAccountEntity, 'taj')
            .innerJoinAndSelect('taj.account', 'account')
            .where('taj.tenant_id = :tenantId', { tenantId: tenant.id })
            .andWhere('taj.role = :role', { role: AccountRole.OWNER })
            .getOne();
        return owner?.account || null;
    }

    private async hasOwner(
        tenant: TenantEntity,
        entityManager?: EntityManager
    ): Promise<boolean> {
        const workManager = entityManager || this.dataSource.manager;
        const owner = await workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                role: AccountRole.OWNER,
            }
        });
        return !!owner;
    }
}


@Injectable()
export class TenantAccountService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getTenanatMember(
        tenant: TenantEntity,
        account: AccountEntity,
        entityManager?: EntityManager
    ): Promise<TenantAccountEntity | null> {
        const workManager = entityManager || this.dataSource.manager;

        return workManager.findOne(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: account.id },
            }
        });
    }

    async removeTenantMember(
        tenant: TenantEntity,
        account: AccountEntity,
        entityManager?: EntityManager
    ): Promise<void> {
        const workManager = entityManager || this.dataSource.manager;

        await workManager.delete(TenantAccountEntity, {
            where: {
                tenant: { id: tenant.id },
                account: { id: account.id },
            },
        });
    }
}
