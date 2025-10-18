import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'provider_model' })
@Index(['tenant', 'providerName', 'modelName', 'modelType'], { unique: true })
@Index(['tenant', 'providerName'])
export class ProviderModelEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantEntity, (tenant) => tenant.providerModels)
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
        name: 'model_name',
        type: 'varchar',
        nullable: false,
        length: 255,
    })
    modelName: string;

    @Column({
        name: 'model_type',
        type: 'varchar',
        nullable: false,
        length: 40,
    })
    modelType: string;

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