import { EntityRepository, Repository } from 'typeorm';
import { Roles, User } from '../../entities/User';
import { LIMIT_TOP_USERS } from './user.constants';
import {
  ChangeUserRoleRequestBody,
  ToggleUserRepositoryData,
  UpdateRepositoryData,
  GetUserInfoBody,
  ToggleShowInfoData,
  GetAllUsersResponse
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
      .innerJoinAndSelect('user.review', 'review')
      .innerJoin('review.author', 'author')
      .addSelect(['author.id', 'author.fullname'])
      .where('user.id = :userId', { userId })
      .getOne()
  }
  getAllUsers(data: GetAllUsersResponse): Promise<User[] | undefined> {
    let { alphabet, rating, createdAt, position } = data;
    const query = this.createQueryBuilder('user')
      .select('user')
    if (alphabet != null) {
      query.orderBy('user.fullname', alphabet.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
    }
    if (rating != null) {
      query.orderBy('user.rating', rating.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
    }
    if (createdAt != null) {
      query.orderBy('user.createdAt', createdAt.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
    }
    if (position != null) {
      query.orderBy('user.position', position.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
    }
    query.where('user.role = :role', { role: Roles.USER })
    return query.getMany();
  }
  updateUser(data: UpdateRepositoryData) {
    const {
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
    return this.createQueryBuilder('user')
      .where('id = :userId', { userId })
      .update(User)
      .set({
        isRequestedReview: true,
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
  toggleShowInfo(data: ToggleShowInfoData) {
    const {
      userId,
      showInfo,
    } = data;
    return this.createQueryBuilder('user')
      .where('id = :userId', { userId })
      .update(User)
      .set({
        showInfo: showInfo,
      })
      .execute();
  }
  async userFewFields(
    id: number, field: string
  ): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .select('user.id')
      .addSelect('user.email')
      .addSelect(`user.${field}`)
      .where('user.id = :id', { id })
      .getOne()
  }
  async getTopUsers() {
    const dateNow = new Date();
    const firstDayMonth = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, 1);
    const lastDayMonth = new Date(dateNow.getFullYear(), dateNow.getMonth(), 0);
    return this.createQueryBuilder('user')
      .select('user')
      .where('user.updatedReviewAt >= :firstDayMonth', { firstDayMonth })
      .andWhere('user.updatedReviewAt <= :lastDayMonth', { lastDayMonth })
      .orderBy('user.rating', 'DESC')
      .limit(LIMIT_TOP_USERS)
      .getMany();
  }
}
