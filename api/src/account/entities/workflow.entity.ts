import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { Operate } from "@/common/database/entities/fields/operate";
import { AppEntity } from "./app.entity";

@Entity({ name: 'workflow' })
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TenantEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  @Index()
  tenant!: TenantEntity;

  @OneToOne(() => AppEntity, app => app.workflow, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id', referencedColumnName: 'id' })
  @Index()
  app!: AppEntity;

  @Column({ nullable: false })
  type!: string;

  @Column({ type: 'text', nullable: false })
  graph!: string;

  @Column({ type: 'text', nullable: false })
  features!: string;

  @Column(() => Operate, { prefix: false })
  operate!: Operate;
}