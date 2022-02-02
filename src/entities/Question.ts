import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

export enum Category {
  EFFECTIVENESS = 'effectiveness',
  INTERACTION = 'interaction',
  ASSESSMENT_OF_ABILITIES = 'assessment of abilities',
  PERSONAL_QUALITIES = 'personal qualities',
  DEFAULT = 'default',
}

@Entity({ name: 'questions' })
export class Review {
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