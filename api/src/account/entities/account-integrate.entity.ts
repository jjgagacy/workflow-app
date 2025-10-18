import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'account_integrate' })
@Index(['accountId', 'provider'], { unique: true })
@Index(['provider', 'openId'], { unique: true })
export class AccountIntegrateEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    })
    accountId: string;

    @Column({
        name: 'provider',
        type: 'varchar',
        length: 16,
        nullable: false,
    })
    provider: string;

    @Column({
        name: 'open_id',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    openId: string;

    @Column({
        name: 'encrypted_token',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    encryptedToken: string;

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