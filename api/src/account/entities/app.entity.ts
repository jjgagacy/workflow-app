import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { Operate } from "@/common/database/entities/fields/operate";
import { WorkflowEntity } from "./workflow.entity";

@Entity({ name: 'app' })
export class AppEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TenantEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  @Index()
  tenant!: TenantEntity;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ nullable: false })
  mode!: string;

  @Column({ nullable: false })
  icon!: string

  @Column({
    type: 'bool',
    nullable: false,
    default: false,
  })
  enableSite!: boolean;

  @Column({
    type: 'bool',
    nullable: false,
    default: false,
  })
  enableApi!: boolean;

  @Column({
    type: 'bool',
    nullable: false,
    default: false,
  })
  isPublic!: boolean;

  @OneToOne(() => WorkflowEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workflow_id', referencedColumnName: 'id' })
  @Index()
  workflow!: WorkflowEntity;

  @Column(() => Operate, { prefix: false })
  operate!: Operate;
}