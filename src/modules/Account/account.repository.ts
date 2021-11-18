import { BusinessRepository } from './../Business/business.repository';
import {
  ChangeBuyersArrayStatusRequest,
  ChangeBuyerStatusRequest,
  RemoveBuyerRequest,
  RemoveBuyersArrayRequest,
  UpdateBuyerRequest,
  UpdatePasswordRepositoryData,
  UpdateSellerRequest,
  GetOneSellerRequest,
  UpdateAccountRequest,
  UpdateBuyerRepositoryData,
} from './account.interfaces';
import {
  Account,
  roles as accountRoles
} from '../../entities/Account';
import {
  types as mediaTypes
} from '../../entities/Media';
import {
  EntityRepository,
  getCustomRepository,
  Repository,
  In
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { REQUESTS_LIMIT, REQUESTS_OFFSET } from './account.constants';
@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {
  all() {
    return this.createQueryBuilder('Account')
      .select('Account')
      .getMany();
  }
  getOneAccount(data: any) {
    const { accountId } = data;
    return this.createQueryBuilder('account')
      .leftJoin('account.businesses', 'business')
      .leftJoin('business.addresses', 'address')
      .select(['account.id', 'account.firstName', 'account.lastName', 'account.phone', 'account.email', 'account.role', 'account.language',
        'account.emailConfirmed', 'account.phoneConfirmed', 'account.sellerApprovedAt', 'account.stripeCustomerId', 'account.createdAt', 'account.updatedAt'])
      .addSelect(['business'])
      .addSelect(['address'])
      .where('account.id = :accountId', { accountId })
      .getOne();
  }

  allSellers({ type, status, limit, offset, orderType, orderValue }: any) {
    const query = this.createQueryBuilder('account')
      .leftJoin('account.businesses', 'business')
      .select('account.firstName')
      .addSelect('account.id')
      .addSelect(['business.type', 'type'])
      .addSelect('account.lastName')
      .addSelect('account.email')
      .addSelect('account.isActive')
      .addSelect('account.isSellerCompleted')
      .where("account.role IN (:...accountRoles)", { accountRoles: [`global_${type}`, `local_${type}`] })
      // .andWhere('account.is_seller_approved = :status', { status })
      .orderBy(`${orderType ?? 'account.createdAt'}`, orderValue ?? 'ASC')
      .offset(offset ? Number(offset) : REQUESTS_OFFSET)
      .limit(limit ? Number(limit) : REQUESTS_LIMIT)
    // if (status) {
    //   query.where('become_seller_request.status = :status', { status })
    // }
    return query.getMany();
  }
  async getOneBuyer(accountId: number) {

    const accountRepo = getCustomRepository(AccountRepository);
    const query = await accountRepo.createQueryBuilder('account')
      .leftJoin('account.medias', 'media', `media.type = :type`, { type: mediaTypes.userAvatar })
      .select(['account.id', 'account.firstName', 'account.lastName', 'account.email', 'account.phone', 'account.language', 'account.role'])
      .addSelect(['media.id', 'media.url', 'media.thumbUrl', 'media.mimetype',])
      .where('account.id = :accountId', { accountId });
    return query.getOne();
  }

  async updateBuyer(data: UpdateBuyerRepositoryData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      language,
      accountId
    } = data;


    const query = await this.createQueryBuilder('account')
      .update(Account)
      .set({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        language: language,
      })
      .where('id = :accountId', { accountId: accountId })
      .execute();
  }
  updateOneBuyer(data: UpdateBuyerRepositoryData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      language,
      accountId,
    } = data;

    return this.createQueryBuilder('account')
      .update(Account)
      .set({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        language: language,
      })
      .where('id = :accountId', { accountId: accountId })
      .execute();
  }
  getBuyers() {
    return this.createQueryBuilder('account')
      .select(['account.id', 'account.firstName', 'account.lastName', 'account.isActive', 'account.phone', 'account.email', 'account.role', 'account.language', 'account.emailConfirmed', 'account.phoneConfirmed', 'account.sellerApprovedAt', 'account.stripeCustomerId', 'account.createdAt', 'account.updatedAt'])
      .where(`account.role = '${accountRoles.user}'`)
      .andWhere(`account.deletedAt IS NULL`)
      .getMany();
  }

  getAllSellers() {
    return this.createQueryBuilder('account')
      .leftJoin('account.businesses', 'business')
      .select(['account.id', 'account.firstName', 'account.lastName', 'account.email', 'account.role', 'account.createdAt', 'account.isActive'])
      .addSelect(['business.type', 'type'])
      .addSelect('business.id')
      .where("account.role IN (:...accountRoles)", { accountRoles: [`${accountRoles.globalSeller}`, `${accountRoles.localSeller}`] })
      .andWhere(`account.deletedAt IS NULL`)
      .getMany();
  }

  removeBuyer({ accountId }: RemoveBuyerRequest) {

    return this.createQueryBuilder('account')
      .update(Account)
      .set({
        deletedAt: new Date(),
      })
      .where('id = :accountId', { accountId: Number(accountId) })
      .andWhere(`role = '${accountRoles.user}'`)
      .execute();
  }

  removeSeller({ accountId }: any) {
    return this.createQueryBuilder('account')
      .delete()
      .from(Account)
      .where('id = :accountId', { accountId: Number(accountId) })
      .andWhere("role IN (:...names)", { names: [`${accountRoles.globalSeller}`, `${accountRoles.localSeller}`] })
      .execute();
  }
  removeBuyersArray({ accountsId }: RemoveBuyersArrayRequest) {

    const accountsIdNumbers = accountsId.map((item: any) => Number(item))

    return this.createQueryBuilder('account')
      .update(Account)
      .set({
        deletedAt: new Date(),
      })
      .where({ id: In(accountsIdNumbers) })
      // .andWhere(`role = '${accountRoles.user}'`)
      .execute();
  }

  changeBuyersArrayStatus({ accountsId, isActive }: ChangeBuyersArrayStatusRequest) {

    const accountsIdNumbers = accountsId.map((item: any) => Number(item))
    return this.createQueryBuilder('account')
      .update(Account)
      .set({
        isActive,
      })
      .where({ id: In(accountsIdNumbers) })
      // .andWhere(`role = '${accountRoles.user}'`)
      .execute();
  }

  changeBuyerStatus({ accountId, isActive }: ChangeBuyerStatusRequest) {
    return this.createQueryBuilder('account').update(Account)
      .set({
        isActive: Boolean(Number(isActive)),
      })
      .where('id = :accountId', { accountId: Number(accountId) })
      .andWhere(`role = '${accountRoles.user}'`)
      .execute();
  }

  changeSellerStatus({ accountId, isActive }: any) {
    return this.createQueryBuilder('account').update(Account)
      .set({
        isActive: Boolean(Number(isActive)),
      })
      .where('id = :accountId', { accountId: Number(accountId) })
      .andWhere("role IN (:...names)", { names: [`${accountRoles.globalSeller}`, `${accountRoles.localSeller}`] })
      // .andWhere(`role = '${accountRoles.user}'`)
      .execute();
  }

  updateOneSeller(data: any) {
    const {
      firstName,
      lastName,
      email,
      accountId,
    } = data;
    return this.createQueryBuilder('account')
      .update(Account)
      .set({
        firstName: firstName,
        lastName: lastName,
        email: email,
      })
      .where('id = :accountId', { accountId: Number(accountId) })
      // .andWhere("role = :accountRole", { accountRole: "globalSeller" })
      .andWhere("role IN (:...names)", { names: [`${accountRoles.globalSeller}`, `${accountRoles.localSeller}`] })
      .execute();
  }

  getOneSeller(data: GetOneSellerRequest) {
    const businessRepo = getCustomRepository(BusinessRepository);
    const { accountId } = data;
    const query = businessRepo.createQueryBuilder('business')
      // .leftJoin('business.categories', 'category')
      .leftJoin('business.account', 'account')
      // .leftJoin('account.listings', 'listing')
      .leftJoin('business.addresses', 'address')
      // .leftJoin('business.businessLanguages', 'business_language')
      // .leftJoin('business_language.language', 'language')
      .select(['account.id', 'account.firstName', 'account.lastName', 'account.phone', 'account.email', 'account.role', 'account.language',
        'account.emailConfirmed', 'account.phoneConfirmed', 'account.sellerApprovedAt', 'account.isSellerCompleted', 'account.isSellerInfoFilled', 'account.stripeCustomerId', 'account.createdAt', 'account.updatedAt',])
      .addSelect('business')
      .leftJoin('business.medias', 'medias')
      .addSelect(['medias.url'])
      // .addSelect('listing')
      // .addSelect('business_language')
      // .addSelect('language')
      // .addSelect('category')
      .addSelect('address')
      .where('account.id = :accountId', { accountId });
    // categoryId && query
    //   .andWhere('category.id = :categoryId', { categoryId })
    //   .andWhere('category.isParent = TRUE')
    // .andWhere('business.isSellerCompleted = true')
    // .where('business.id = 79')
    return query.getOne();
  }

  updateSeller(data: UpdateSellerRequest) {
    const {
      firstName,
      lastName,
      // email,
      password,
      account,
    } = data;
    account.firstName = firstName;
    account.lastName = lastName;
    // account.email = email;
    if (password) account.password = password;

    return this.save(account);
  }
  updatePassword({ account, password }: UpdatePasswordRepositoryData) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    account.password = passwordHash;
    return this.save(account);
  }

  updateAccount(data: UpdateAccountRequest) {
    const { accountId, ...other } = data;
    return this.update({
      id: accountId,
    }, other);
  }
}
