import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuRoleEntity } from "./menu-role.entity";
import { Operate } from "@/common/database/entities/fields/operate";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'role' })
@Index(['tenant', 'key'], { unique: true })
@Index(['tenant', 'name'], { unique: true })
export class RoleEntity extends BaseEntity {
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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;
}