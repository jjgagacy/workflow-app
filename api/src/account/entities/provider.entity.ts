import { Operate } from "@/common/database/entities/fields/operate";
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { ProviderModelEntity } from "./provider-model.entity";

@Entity({ name: 'provider' })
@Index(['tenant', 'providerName'])
@Index(['tenant', 'providerName', 'providerType', 'quotaType'], { unique: true })
export class ProviderEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'provider_name',
        type: 'varchar',
        nullable: false,
        length: 255,
    })
    providerName: string;

    @Column({
        name: 'provider_type',
        type: 'varchar',
        nullable: false,
        default: 'custom',
        length: 40,
    })
    providerType: string;

    @Column({
        name: 'encrypted_config',
        type: 'text',
        nullable: true,
    })
    encryptedConfig?: string;

    @Column({
        name: 'is_valid',
        type: 'bool',
        nullable: false,
        default: false,
    })
    isValid: boolean;

    @Column({
        name: 'last_used',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    lastUsed?: Date;

    @Column({
        name: 'quota_type',
        type: 'varchar',
        length: 40,
        default: '',
        nullable: false,
    })
    quotaType: string;

    @Column({
        name: 'quota_limit',
        type: 'bigint',
        nullable: true,
    })
    quotaLimit?: number;

    @Column({
        name: 'quota_used',
        type: 'bigint',
        nullable: true,
    })
    quotaUsed?: number;

    @Column(() => Operate, { prefix: false })
    operate: Operate;

    @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
    @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
    tenant: TenantEntity;
}