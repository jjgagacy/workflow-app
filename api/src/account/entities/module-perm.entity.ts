import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { MenuRoleEntity } from "./menu-role.entity";
import { ModuleEntity } from "./module.entity";
import { PermEntity } from "./perm.entity";

@Entity({ name: 'module_perm' })
export class ModulePermEntity extends BaseEntity {
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
    nullable: false,
    type: 'int',
    default: 0,
  })
  restrictLevel: number;

  // 不能 relations { module: true }
  @ManyToOne(() => ModuleEntity, module => module.perms, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  module: ModuleEntity;

  @ManyToMany(() => MenuRoleEntity, {
    cascade: true,
  })
  menuRoles: MenuRoleEntity[];

  @ManyToMany(() => PermEntity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'module_perm_level' })
  perms: PermEntity[];

  @Column({
    nullable: false,
    type: 'uuid',
  })
  tenantId: string;
}
