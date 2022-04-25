import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BeforeInsert,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'appraisers' })
export class Appraise {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => User, (user) => user.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @Column({
        default: false,
        type: 'boolean',
        name: 'status'
    })
    status!: boolean;

    @Column('timestamp', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt!: Date;

    @BeforeInsert()
    beforeInsert() {
        this.createdAt = new Date();
    }
}
