import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ModulePermEntity } from "./module-perm.entity";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'perm' })
@Index(['tenant', 'key'], { unique: true })
@Index(['tenant', 'name'], { unique: true })
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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;
}