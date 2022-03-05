import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

export enum Position {
  JUNIOR_DEVELOPER = 'junior developer',
  MIDDLE_DEVELOPER = 'middle developer',
  SENIOR_DEVELOPER = 'senior developer',
  MANAGER = 'manager',
  TESTER = 'tester',
  BOSS = 'boss',
}

export enum Category {
  EFFECTIVENESS = 'effectiveness',
  INTERACTION = 'interaction',
  ASSESSMENT_OF_ABILITIES = 'assessment of abilities',
  PERSONAL_QUALITIES = 'personal qualities',
  DEFAULT = 'default',
}

export const category = {
  effectiveness: Category.EFFECTIVENESS,
  interaction: Category.INTERACTION,
  assessmentOfAbilities: Category.ASSESSMENT_OF_ABILITIES,
  personalQualities: Category.PERSONAL_QUALITIES,
  default: Category.DEFAULT,
}

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    name: 'description',
  })
  description!: string;

  @Column({
    type: 'enum',
    enum: Category,
    default: Category.DEFAULT,
    name: 'category',
  })
  category!: string;

  @Column({
    type: 'float',
    name: 'weight',
  })
  weight!: number;

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

  @Column({
    nullable: true,
    type: 'enum',
    enum: Position,
    name: 'position',
  })
  position!: string;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}
