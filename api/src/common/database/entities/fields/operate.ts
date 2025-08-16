import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class Operate {
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

    @Column({
        name: 'created_by',
        type: 'varchar',
        length: 32,
        nullable: false,
        default: '',
    })
    createdBy: string;

    @Column({
        name: 'updated_by',
        type: 'varchar',
        length: 32,
        nullable: false,
        default: '',
    })
    updatedBy: string;
}