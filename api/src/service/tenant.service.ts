import { I18nTranslations } from "@/generated/i18n.generated";
import { Injectable } from "@nestjs/common";
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

        if (!this.systemService.allowCreateWorkspace &&
            !isSetup
        ) {
            throw new BadRequestGraphQLException(this.i18n.t('tenant.WORKSPACE_CREATE_NOT_ALLOWD'));
        }
        const workManager = entityManager || this.dataSource.manager;
        const tenant = workManager.create(TenantEntity, {
            name: dto.name,
            operate: {
                createdBy: dto.createdBy
            }
        });
        // todo 密钥等其他信息
        return await workManager.save(tenant);
    }

    async addAccountTenantMembership(account: AccountEntity, tenant: TenantEntity, role: AccountRole, entityManager?: EntityManager): Promise<TenantAccountEntity | null> {
        if (!EnumUtils.safeValidateEnumValues(AccountRole, [role])) {
            throw new Error('Role must be AccountRole');
        }
        const workManager = entityManager ? entityManager : this.dataSource.manager;
        return workManager.transaction(async (manager) => {
            if (role == AccountRole.OWNER) {
                if (await this.hasRoles(tenant, [AccountRole.OWNER])) {
                    throw new BadRequestGraphQLException('Tenant alrady has an owner');
                }
            }

            // execute upsert
            const result = await manager
                .createQueryBuilder()
                .insert()
                .into(TenantAccountEntity)
                .values({
                    tenant: tenant,
                    account: account,
                    role: role
                })
                .orUpdate(['role'], ['tenant_id', 'account_id'])
                .execute();

            if (!result || !result.identifiers || result.identifiers.length === 0) {
                throw new Error('Failed to upsert result');
            }

            return manager.findOne(TenantAccountEntity, {
                where: { tenant: { id: tenant.id }, account: { id: account.id } }
            });
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
}