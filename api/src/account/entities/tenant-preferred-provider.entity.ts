import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'tenant_preferred_provider' })
@Index(['tenant', 'providerName'])
export class TenantPreferredProviderEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantEntity, (tenant) => tenant.preferredProviders)
    @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
    tenant: TenantEntity;

    @Column({
        name: 'provider_name',
        type: 'varchar',
        nullable: false,
        length: 255,
    })
    providerName: string;

    @Column({
        name: 'preferred_provider_type',
        type: 'varchar',
        nullable: false,
        length: 40,
    })
    preferredProviderType: string;

    @CreateDateColumn({
        name: 'created_at',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
