import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AppEntity } from "./app.entity";
import { Operate } from "@/common/database/entities/fields/operate";

@Entity({ name: 'app_model_config' })
export class AppModelConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AppEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id', referencedColumnName: 'id' })
  app!: AppEntity;

  @Column({ nullable: false })
  provider!: string;

  @Column({ nullable: false })
  model!: string;

  @Column({ type: 'json', nullable: false })
  configuration!: string;

  @Column(() => Operate, { prefix: false })
  operate!: Operate;
}