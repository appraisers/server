import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';

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

  @Column({
    nullable: true,
    type: 'text',
    name: 'description',
  })
  description!: string | null;

  @Column({
    nullable: true,
    type: 'float',
    name: 'rating',
  })
  rating!: number;

  @Column({
    default: true,
    type: 'boolean',
    name: 'active_session'
  })
  activeSession!: boolean;

  @Column({
    default: 0,
    type: 'float',
    name: 'temporary_rating'
  })
  temporaryRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'effectiveness_rating'
  })
  effectivenessRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'interaction_rating'
  })
  interactionRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'assessment_of_abilities_rating'
  })
  assessmentOfAbilitiesRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'personal_qualities_rating'
  })
  personalQualitiesRating!: number;

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
    select: false,
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
