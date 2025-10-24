import { DepEntity } from "@/account/entities/dep.entity";
import { RoleEntity } from "@/account/entities/role.entity";
import { Operate } from "@/common/database/entities/fields/operate";
import { BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'account' })
export class AccountEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        unique: false,
    })
    @Index()
    username: string;

    @Column({
        nullable: false,
        default: '',
    })
    password: string;

    @Column({
        nullable: false,
        default: '',
    })
    realName: string;

    @Column({
        nullable: false,
        default: '',
    })
    @Index()
    email: string;

    @Column({
        nullable: false,
        default: '',
    })
    mobile: string;

    @Column({
        nullable: false,
        default: '',
    })
    avatar: string;

    @Column({
        nullable: false,
        default: '',
    })
    prefer_language: string;

    @Column({
        nullable: false,
        default: '',
    })
    theme: string;

    @Column({
        nullable: false,
        default: '',
    })
    timezone: string;

    // 0开启 1关闭
    @Column({
        nullable: false,
        type: 'int',
        default: 0,
    })
    status: number;

    @Column({
        nullable: false,
        default: '',
    })
    lastIp: string;

    @Column(() => Operate, { prefix: false })
    operate: Operate;

    @ManyToMany(() => RoleEntity, {
        cascade: true
    })
    @JoinTable({
        name: 'account_role',
        joinColumn: {
            name: 'account_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
    })
    roles: RoleEntity[];

    @ManyToOne(() => DepEntity, {
        cascade: ['insert'],
        onDelete: 'SET NULL',
    })
    dep: DepEntity;
}