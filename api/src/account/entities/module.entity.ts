import { BaseEntity, Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuEntity } from "./menu.entity";
import { ModulePermEntity } from "./module-perm.entity";

@Entity({ name: 'module' })
export class ModuleEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    key: string;

    @Column({
        nullable: false,
    })
    name: string;

    @OneToMany(() => ModulePermEntity, modulePerm => modulePerm.module, {
        cascade: ['insert'],
    })
    perms: ModulePermEntity[];

    @OneToMany(() => MenuEntity, menu => menu.module, {
        cascade: ['insert'],
    })
    menus: MenuEntity[];
}