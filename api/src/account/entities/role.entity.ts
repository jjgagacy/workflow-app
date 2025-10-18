import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuRoleEntity } from "./menu-role.entity";
import { Operate } from "@/common/database/entities/fields/operate";

@Entity({ name: 'role' })
export class RoleEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    key: string;

    @Column({
        nullable: false,
        unique: true,
    })
    name: string;

    @Column({
        nullable: false,
    })
    parent: string;

    // 0开启 1关闭
    @Column({
        nullable: false,
        type: 'int',
        default: 0,
    })
    status: number;

    @Column(() => Operate, { prefix: false })
    operate: Operate;

    @OneToMany(() => MenuRoleEntity, menuRole => menuRole.role)
    menus: MenuRoleEntity[];
}