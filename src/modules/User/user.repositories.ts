import { EntityRepository, Repository } from 'typeorm';
import { Roles, User } from '../../entities/User';
import {
  ChangeUserRoleRequestBody,
  ToggleUserRepositoryData,
  UpdateRepositoryData,
  GetUserInfoBody
} from './user.interfaces';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findOneUserByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ where: { [key]: val } });
  }
  getUserById(data: GetUserInfoBody): Promise<User | undefined> {
    const { userId } = data;
    return this.createQueryBuilder('user')
      .select('user')
      .leftJoinAndSelect('user.ratingByCategories', 'ratingByCategories')
      .where('user.id = :userId', { userId })
      .getOne()
  }
  getAllUsers(): Promise<User[] | undefined> {
    return this.createQueryBuilder('user')
      .select('user')
      .orderBy('user.id', 'ASC')
      .where('user.role = :role', { role: Roles.USER })
      .getMany();
  }
  updateUser(data: UpdateRepositoryData) {
    const {
      email,
      workplace,
      fullname,
      position,
      rating,
      role,
      id,
      authorId,
    } = data;

    return this.createQueryBuilder('user')
      .update(User)
      .set({
        email: email,
        workplace: workplace ?? '',
        fullname: fullname,
        position: position,
        rating: rating,
        role: role ?? Roles.USER,
        updatedAt: new Date(),
      })
      .where('id = :accountId', { accountId: id ?? authorId })
      .execute();
  }
  toggleUser(data: ToggleUserRepositoryData) {
    const { userId, type } = data;

    return this.createQueryBuilder('user')
      .update(User)
      .set({ deletedAt: type === 'delete' ? new Date() : null })
      .where('id = :userId', { userId })
      .execute();
  }
  changeRoleUser(data: ChangeUserRoleRequestBody) {
    const { userId, role } = data;

    return this.createQueryBuilder('user')
      .update(User)
      .set({
        role: role,
      })
      .where('id = :userId', { userId })
      .execute();
  }
  selfRequest(data: GetUserInfoBody) {
    const {
      userId,
    } = data;
    const tmbDate = new Date();
    const sixMonthAgo = new Date(tmbDate.getFullYear(), tmbDate.getMonth() - 5);
    return this.createQueryBuilder('user')
      .where('id = :userId', { userId })
      .andWhere('updated_review_at <= :sixMonthAgo', { sixMonthAgo })
      .andWhere('is_requested = false')
      .update(User)
      .set({
        isRequested: true,
      })
      .execute();
  }
  getModerators(): Promise<User[] | undefined> {
    return this.createQueryBuilder('user')
      .select('user')
      .orderBy('user.id', 'ASC')
      .where('user.role = :role', { role: Roles.MODERATOR })
      .getMany()
  }
}
