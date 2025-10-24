import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'operation_logs' })
export class OperationLogsEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'tenant_id',
        type: 'uuid',
        nullable: false,
    })
    tenantId: string;

    @Column({
        name: 'account_id',
        type: 'int',
        nullable: false,
    })
    accountId: number;

    @Column({
        name: 'action',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    action: string;

    @Column({
        name: 'content',
        type: 'json',
        nullable: true,
    })
    content?: Record<string, any>;

    @Column({
        name: 'created_ip',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    createdIp: string;

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