import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuRoleEntity } from "./menu-role.entity";
import { ModuleEntity } from "./module.entity";

@Entity({ name: 'menu' })
export class MenuEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        unique: true,
    })
    key: string;

    @Column({
        nullable: false,
        unique: false,
    })
    name: string;

    @Column({
        nullable: false,
        unique: false,
    })
    parent: string;

    @Column({
        nullable: false,
    })
    icon: string;

    @Column({
        nullable: false,
    })
    sort: number;

    // 0开启 1关闭
    @Column({
        nullable: false,
        type: 'int',
        default: 0,
    })
    status: number;

    @ManyToOne(() => ModuleEntity, module => module.menus, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    module?: ModuleEntity;

    @OneToMany(() => MenuRoleEntity, menuRole => menuRole.menu)
    roles: MenuRoleEntity[];
}