import { Operate } from "@/common/database/entities/fields/operate";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProviderEntity } from "./provider.entity";
import { TenantDefaultModelEntity } from "./tenant-default-model.entity";
import { TenantPreferredProviderEntity } from "./tenant-preferred-provider.entity";
import { ProviderModelEntity } from "./provider-model.entity";
import { ProviderModelSettingEntity } from "./provider-model-setting.entity";

@Entity({ name: 'tenant' })
export class TenantEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        nullable: false,
        unique: true,
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    encryptPublicKey: string | null;

    @Column({
        type: 'varchar',
        nullable: false,
        default: 'basic',
    })
    plan: string;

    @Column({
        type: 'varchar',
        nullable: false,
        default: 'normal',
    })
    status: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    customConfig: string | null;

    @OneToMany(() => ProviderEntity, (provider) => provider.tenant)
    providers: [ProviderEntity];

    @OneToMany(() => TenantDefaultModelEntity, (defaultModel) => defaultModel.tenant)
    defaultModels: [TenantDefaultModelEntity];

    @OneToMany(() => TenantPreferredProviderEntity, (preferredProvider) => preferredProvider.tenant)
    preferredProviders: [TenantPreferredProviderEntity];

    @OneToMany(() => ProviderModelEntity, (providerModel) => providerModel.tenant)
    providerModels: [ProviderModelEntity];

    @OneToMany(() => ProviderModelSettingEntity, (providerModelSetting) => providerModelSetting.tenant)
    providerModelSettings: [ProviderModelSettingEntity];

    @Column(() => Operate, { prefix: false })
    operate: Operate;
}