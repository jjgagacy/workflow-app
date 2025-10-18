import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    name?: string;

    @Column({
        name: 'tenant_id',
        type: 'uuid',
        nullable: false,
    })
    tenantId: string;

    @Column({
        name: 'app_id',
        type: 'uuid',
        nullable: true,
    })
    appId?: string;

    @Column({
        name: 'type',
        type: 'varchar',
        length: 16,
        nullable: false,
    })
    type: string;

    @Column({
        name: 'external_user_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    externalUserId: string;

    @Column({
        name: 'is_anonymous',
        type: 'bool',
        default: true,
    })
    isAnonymous: boolean;

    @Column({
        name: 'session_id',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    sessionId: string;

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