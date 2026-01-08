import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuEntity } from "./menu.entity";
import { ModulePermEntity } from "./module-perm.entity";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'module' })
@Index(['tenant', 'key'], { unique: true })
@Index(['tenant', 'name'], { unique: true })
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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;
}