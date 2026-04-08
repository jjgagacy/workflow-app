import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { AppEntity } from "./app.entity";

@Entity({ name: "installed_app" })
export class InstalledAppEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => TenantEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  @Index()
  tenant!: TenantEntity;

  @ManyToOne(() => AppEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id', referencedColumnName: 'id' })
  app!: AppEntity;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    type: 'bool',
    nullable: false,
    default: false,
  })
  isPinned!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastUsedAt!: Date | null;
}
