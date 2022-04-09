import { Token } from '../../entities/Token';
import {
  EntityRepository,
  Repository,
} from 'typeorm';
//import { genSaltSync, hashSync } from 'bcryptjs';
import { User } from '../../entities/User';
import {
  RegisterRepositoryData,
  ConfirmRequestBody,
  ResetPasswordData,
  UpdateUserAfterReview
} from './auth.interfaces';
import { EXPIRED } from './auth.constants';
interface CreateTokenRequest {
  user: User;
  refreshToken: string;
}
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(data: RegisterRepositoryData): Promise<User> {
    const { email, fullname, password } = data;
    const user = new User();
    user.fullname = fullname ?? null;
    user.email = email;
    user.password = password;
    await this.save(user);
    return user;
  }
  resetPassword(data: ResetPasswordData) {
    // const salt = genSaltSync(10);
    const { password, forgotPasswordToken } = data;
    return this.createQueryBuilder('user')
      .update(User)
      .set({
        password: password,
        forgotPasswordToken: null,
      })
      .where('forgot_password_token = :forgotPasswordToken', {
        forgotPasswordToken,
      })
      .execute();
  }
  async findOneUserByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ where: { [key]: val } });
  }

  async userFewFields(
    id: number,
    field: string
  ): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .select('user.id')
      .addSelect('user.email')
      .addSelect(`user.${field}`)
      .where('user.id = :id', { id })
      .getOne()
  }

  async updateUserAfterReview(data: UpdateUserAfterReview) {
    const { userId, rating, numberOfCompletedReviews } = data;
    return this.createQueryBuilder('user')
      .update(User)
      .set({
        rating: rating,
        numberOfCompletedReviews: numberOfCompletedReviews,
        updatedReviewAt: new Date(),
      })
      .where('id = :userId', {
        userId,
      })
      .execute();
  }
  // async getMediaForUser(userId: ID) {
  //   const userRepo = getCustomRepository(UserRepository);
  //   const query = await userRepo.createQueryBuilder('user')
  //     .leftJoin('user.medias', 'media')
  //     .select('user.id')
  //     .addSelect('media.url')
  //     .where('user.id = :userId', { userId });
  //   return query.getOne();
  // }
}

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
  async createRefresh({ user, refreshToken }: CreateTokenRequest) {
    const token = new Token();
    token.refreshToken = refreshToken;
    token.refreshTokenExpiredDate = new Date(Date.now() + EXPIRED.REFRESH);
    token.user = user;
    await this.save(token);
    return token;
  }
  async removeRefresh(refreshToken: string): Promise<any> {
    const refresh = await this.findOne({ where: { refreshToken } });
    refresh && (await this.remove(refresh));
  }
}
