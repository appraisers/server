import { Column, Entity, PrimaryGeneratedColumn, BeforeUpdate, BeforeInsert, JoinColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';

@Entity({ name: 'tokens' })
@Index(['user', 'refreshToken'])
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    name: 'refresh_token'
  })
  refreshToken!: string;

  @Column('timestamp', {
    name: 'refresh_token_expires_date',
  })
  refreshTokenExpiredDate!: Date;

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

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
  }
  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }

  @ManyToOne((type) => User, (user) => user.tokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user!: User;
}
