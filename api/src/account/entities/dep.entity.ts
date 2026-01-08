import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: 'dep' })
@Index(['tenant', 'key'], { unique: true })
@Index(['tenant', 'name'], { unique: true })
export class DepEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  key: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  parent: string;

  @Column({ nullable: false })
  remarks: string;

  // 负责人
  @Column({ nullable: false })
  managerId: number;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;
}