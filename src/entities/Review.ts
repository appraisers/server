import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToOne
} from 'typeorm';
import { User } from './User';
import { Rating } from './Rating';

@Entity({ name: 'reviews' })
export class Review {
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

  @OneToOne(() => Rating, (rating) => rating.review, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  rating!: Rating;

  @Column({
    nullable: true,
    type: 'text',
    name: 'description',
  })
  description!: string | null;

  @Column({
    default: true,
    type: 'boolean',
    name: 'active_session'
  })
  activeSession!: boolean;

  @Column({
    nullable: true,
    type: 'float',
    name: 'answered_questions'
  })
  answeredQuestions!: number;

  @Column('timestamp', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt!: Date;

  @Column('timestamp', {
    nullable: true,
    default: () => 'NULL',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @Column('timestamp', {
    nullable: true,
    default: () => 'NULL',
    name: 'deleted_at',
  })
  deletedAt!: Date;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}
