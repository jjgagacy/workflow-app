import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'tenant_default_model' })
@Index(['tenant', 'providerName', 'modelName'])
export class TenantDefaultModelEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantEntity, (tenant) => tenant.defaultModels)
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
