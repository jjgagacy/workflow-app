import { I18nTranslations } from "@/generated/i18n.generated";
import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CreateTenantDto } from "./dto/tenant.dto";
import { DataSource, EntityManager } from "typeorm";
import { plainToInstance } from "class-transformer";
import { throwIfDtoValidateFail } from "@/common/utils/validation";
import { SystemService } from "@/monie/system.service";
import { BadRequestGraphQLException } from "@/common/exceptions";
import { TenantEntity } from "@/account/entities/tenant.entity";
import { AccountRole, getAccountRoleValue } from "@/account/account.enums";
import { AccountEntity } from "@/account/entities/account.entity";

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

    async addAccountTenantMembership(account: AccountEntity, tenant: TenantEntity, role: AccountRole, entityManager?: EntityManager) {
        if (role == AccountRole.OWNER) {
            // todo
        }
    }
}