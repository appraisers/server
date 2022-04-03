import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './Review';
import { User } from './User'

@Entity({ name: 'ratings' })
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Review, (review) => review.rating, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review!: Review;

  @ManyToOne(() => User, (user) => user.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    nullable: true,
    type: 'float',
    name: 'rating',
  })
  rating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'effectiveness_rating',
  })
  effectivenessRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'interaction_rating',
  })
  interactionRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'assessment_of_abilities_rating',
  })
  assessmentOfAbilitiesRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'personal_qualities_rating',
  })
  personalQualitiesRating!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'effectiveness_weight',
  })
  effectivenessWeight!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'interaction_weight',
  })
  interactionWeight!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'assessment_of_abilities_weight',
  })
  assessmentOfAbilitiesWeight!: number;

  @Column({
    default: 0,
    type: 'float',
    name: 'personal_qualities_weight',
  })
  personalQualitiesWeight!: number;

  @Column('timestamp', {
    nullable: true,
    default: () => 'NULL',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}
