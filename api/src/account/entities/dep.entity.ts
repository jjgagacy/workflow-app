import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'dep'})
export class DepEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    key: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false})
    parent: string;

    @Column({ nullable: false})
    remarks: string;

    // 负责人
    @Column({ nullable: false})
    managerId: number;
}