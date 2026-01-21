import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TenantEntity } from "./tenant.entity";
import { AccountEntity } from "./account.entity";

@Entity({ name: 'upload_files' })
@Index(['tenant', 'key'], { unique: true })
export class UploadFilesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.id)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: TenantEntity;

  @Column({
    nullable: false,
  })
  storageType: string;

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
  size: number;

  @Column({
    nullable: false,
  })
  extension: string;

  @Column({
    nullable: true,
  })
  mimeType: string;

  @Column({
    nullable: true,
  })
  hash: string;

  @Column({
    nullable: true,
  })
  sourceUrl: string;

  @Column({ nullable: true })
  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'created_account', referencedColumnName: 'id' })
  createdAccount: AccountEntity;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  createdUser: string;

  @Column({ nullable: false })
  createdRole: string;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
