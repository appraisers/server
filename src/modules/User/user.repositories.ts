import { EntityRepository, Repository } from 'typeorm';
import { Roles, User } from '../../entities/User';
import {
  ChangeUserRoleRequestBody,
  DeleteUserRequestBody,
  UpdateRepositoryData,
} from './user.interfaces';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findOneUserByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ where: { [key]: val } });
  }
  getAllUsers(): Promise<User[] | undefined> {
    return this.createQueryBuilder('user')
      .select('user')
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
  deleteUser(data: DeleteUserRequestBody) {
    const { userId } = data;

    return this.createQueryBuilder('user')
      .update(User)
      .set({
        deletedAt: new Date(),
      })
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
}
