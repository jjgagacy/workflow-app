import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MenuEntity } from "./menu.entity";
import { RoleEntity } from "./role.entity";
import { ModulePermEntity } from "./module-perm.entity";

@Entity({ name: 'menu_role' })
export class MenuRoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    scope: string;

    @ManyToOne(() => MenuEntity, menu => menu.roles, {
        onDelete: 'CASCADE',
    })
    menu: MenuEntity;

    @ManyToOne(() => RoleEntity, role => role.menus, {
        onDelete: 'CASCADE',
    })
    role: RoleEntity;

    @ManyToMany(() => ModulePermEntity, {
        cascade: true,
    })
    @JoinTable({ name: 'menu_role_perm' })
    perms: ModulePermEntity[];
}