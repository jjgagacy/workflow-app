import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { ModulePermEntity } from "./module-perm.entity";

@Entity({ name: 'perm' })
export class PermEntity extends BaseEntity {
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

    @Column({
        type: 'int',
        default: 0,
    })
    level: number;

    @ManyToMany(() => ModulePermEntity, {
        cascade: true,
    })
    perms: ModulePermEntity[];
}