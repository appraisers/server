import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Token } from './Token';

export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}
export const roles = {
  admin: Roles.ADMIN,
  user: Roles.USER,
};

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'fullname',
  })
  fullname!: string | null;

  @Column({
    nullable: true,
    unique: true,
    type: 'varchar',
    name: 'email',
  })
  email!: string | null;

  @Column({
    type: 'varchar',
    name: 'password',
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: roles.user,
    name: 'role',
  })
  role!: Roles;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'forgot_password_token',
  })
  forgotPasswordToken!: string | null;

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

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[];
}
