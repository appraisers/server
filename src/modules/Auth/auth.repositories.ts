import { Token } from '../../entities/Token';
import { EntityRepository, Repository, getRepository, getCustomRepository } from 'typeorm';
import { User as User, roles } from '../../entities/User';
import { RegisterRepositoryData, ConfirmRequestBody } from './auth.interfaces';
import { EXPIRED } from './auth.constants';
import { genSaltSync, hashSync } from 'bcryptjs';

interface CreateTokenRequest {
  user: User,
  refreshToken: string;
}
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(data: RegisterRepositoryData): Promise<User> {
    const {
      email,
      fullname,
      workplace,
      password,
    } = data;

    const user = new User();
    user.fullname = fullname ?? null;
    user.email = email;
    user.workplace = workplace;
    user.password = password;
    await this.save(user);
    return user;
  }
  resetPassword(data: any) {
    const salt = genSaltSync(10);
    return this.update({
      forgotPasswordToken: data.token
    }, {
      password: hashSync(data.password, salt),
      forgotPasswordToken: null,
    });
  }
  findOneWithPasswordByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ [key]: val }, { select: ['id', 'password', 'role'] });
  }

  async findOneUserByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ where: { [key]: val } });
  }

  // async getMediaForUser(userId: number) {
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
    refresh && await this.remove(refresh);
  }
}