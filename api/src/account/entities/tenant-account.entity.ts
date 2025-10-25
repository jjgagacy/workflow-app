import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { AccountEntity } from "./account.entity";

@Entity({ name: 'tenant_account' })
@Index(['tenant', 'account'], { unique: true })
export class TenantAccountEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TenantEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
    @Index()
    tenant: TenantEntity;

    @ManyToOne(() => AccountEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    @Index()
    account: AccountEntity;

    @Column({
        type: 'varchar',
        nullable: false,
        default: 'owner',
    })
    role: string;

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