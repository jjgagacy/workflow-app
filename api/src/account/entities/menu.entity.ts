import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuRoleEntity } from "./menu-role.entity";
import { ModuleEntity } from "./module.entity";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'menu' })
@Index(['tenant', 'key'], { unique: true })
export class MenuEntity extends BaseEntity {
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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;
}