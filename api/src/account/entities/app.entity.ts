import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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
  iconType!: string;

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

  @Column({ nullable: false })
  accountId!: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 32,
    nullable: false,
    default: '',
  })
  createdBy!: string;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 32,
    nullable: false,
    default: '',
  })
  updatedBy?: string;
}