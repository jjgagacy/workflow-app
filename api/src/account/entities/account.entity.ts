import { Operate } from "src/common/database/entities/fields/operate";
import { DepEntity } from "src/account/entities/dep.entity";
import { RoleEntity } from "src/account/entities/role.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'account' })
export class AccountEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        unique: true,
    })
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
    email: string;

    @Column({
        nullable: false,
        default: '',
    })
    mobile: string;

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

    @Column(() => Operate, { prefix: false})
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