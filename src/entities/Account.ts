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
  GLOBAL_SELLER = 'global_seller',
  LOCAL_SELLER = 'local_seller', //not worked
}
export const roles = {
  admin: Roles.ADMIN,
  user: Roles.USER,
  globalSeller: Roles.GLOBAL_SELLER,
  localSeller: Roles.LOCAL_SELLER,
};
export enum Languages {
  en = 'en',
  ru = 'ru',
}
@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'first_name',
  })
  firstName!: string | null;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'last_name',
  })
  lastName!: string | null;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'phone',
  })
  phone!: string | null;

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
    type: 'enum',
    enum: Languages,
    default: Languages.en,
    name: 'language',
  })
  language!: Languages;

  @Column({
    type: 'boolean',
    name: 'email_confirmed',
  })
  emailConfirmed!: boolean;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'email_confirmation_token',
  })
  emailConfirmationToken!: string | null;

  @Column({
    type: 'boolean',
    name: 'phone_confirmed',
  })
  phoneConfirmed!: boolean;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'forgot_password_token',
  })
  forgotPasswordToken!: string | null;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'phone_confirmation_token',
  })
  phoneConfirmationToken!: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_online',
  })
  isOnline!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_seller_approved',
  })
  isSellerApproved!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_seller_completed',
  })
  isSellerCompleted!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_seller_info_filled',
  })
  isSellerInfoFilled!: boolean;

  @Column({
    nullable: true,
    default: () => 'NULL',
    name: 'seller_approved_at',
  })
  sellerApprovedAt!: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'stripe_customer_id',
  })
  stripeCustomerId!: string;

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
