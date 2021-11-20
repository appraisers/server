import { Token } from '../../entities/Token';
import { EntityRepository, Repository, getRepository, getCustomRepository } from 'typeorm';
import { Account as User, roles } from '../../entities/Account';
import { RegisterRepositoryData, ConfirmRequestBody } from './auth.interfaces';
import { EXPIRED } from './auth.constants';
import { genSaltSync, hashSync } from 'bcryptjs';
import { Cart } from '../../entities/Cart';
import { AccountRepository } from '../Account/account.repository';

interface CreateTokenRequest {
  user: User,
  refreshToken: string;
}
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  createUser(data: RegisterRepositoryData): Promise<User> {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      emailConfirmed,
      emailConfirmationToken,
      phoneConfirmed,
      phoneConfirmationToken,
    } = data;

    const user = new User();
    user.firstName = firstName ?? null;
    user.lastName = lastName ?? null;
    user.email = email;
    user.password = password;
    user.phone = phone;
    user.role = role ?? roles.user;
    user.emailConfirmed = emailConfirmed;
    user.emailConfirmationToken = emailConfirmationToken;
    user.phoneConfirmed = phoneConfirmed;
    user.phoneConfirmationToken = phoneConfirmationToken;
    return this.save(user);
  }
  createCart({ user }: { user: User }) {
    const cartRepo = getRepository(Cart);
    const cart = new Cart;
    cart.owner = user;
    return cartRepo.save(cart);
  }
  confirm(data: ConfirmRequestBody): Promise<any> {
    return this.update(
      {
        emailConfirmationToken: data.token,
      }, {
      emailConfirmationToken: null,
      emailConfirmed: true
    }
    );
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
    return this.findOne({ [key]: val }, { select: ['id', 'password', 'emailConfirmed', 'phoneConfirmed', 'role', 'isActive', 'isSellerApproved'] });
  }

  async findOneUserByKey<T extends keyof User>(
    key: T,
    val: string | number
  ): Promise<User | undefined> {
    return this.findOne({ where: { [key]: val } });
  }

  async getMediaForAccount(accountId: number) {
    const accountRepo = getCustomRepository(AccountRepository);
    const query = await accountRepo.createQueryBuilder('account')
      .leftJoin('account.medias', 'media')
      .select('account.id')
      .addSelect('media.url')
      .where('account.id = :accountId', { accountId });
    return query.getOne();
  }
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