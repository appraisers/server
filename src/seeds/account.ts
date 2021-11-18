import { hashSync } from 'bcryptjs';
import { getRepository } from 'typeorm';
import { Account, Languages, roles } from '../entities/Account';

export const emailsArray: Array<string> = [
  'dmitry.trifonov@websailors.pro', // admin
  'dtrifonov100@gmail.com', // global_seller
  'dtrifonov101@gmail.com', // user
  'dtrifonov102@gmail.com', // user
  'dtrifonov103@gmail.com', // global_seller
];

export const getAccounts = async () => {
  const accountRepo = getRepository(Account);
  const accounts: Array<Account> = await accountRepo.createQueryBuilder('account')
    .leftJoin('account.addresses', 'address')
    .leftJoin('account.businesses', 'business')
    .select('account')
    .addSelect('address')
    .addSelect('business')
    .where('account.email IN (:...emailsArray)', { emailsArray })
    .orderBy('account.id', 'ASC')
    .getMany();
  return accounts;
}

export const getOtherAccounts = async () => {
  const accountRepo = getRepository(Account);
  const accounts: Array<Account> = await accountRepo.createQueryBuilder('account')
    .leftJoin('account.addresses', 'address')
    .leftJoin('account.businesses', 'business')
    .select('account')
    .addSelect('address')
    .addSelect('business')
    .where(`account.firstName LIKE 'John %'`)
    .orderBy('account.id', 'ASC')
    .getMany();
  return accounts;
}


const accounts = [
  {
    firstName: 'Dmitry',
    lastName: 'Admin',
    phone: '111-111-111-0001',
    email: 'dmitry.trifonov@websailors.pro',
    password: hashSync('Qwerty1!'),
    role: roles.admin,
    language: Languages.en,
    emailConfirmed: true,
    phoneConfirmed: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  }, {
    firstName: 'Vasya',
    lastName: 'Global Seller',
    phone: '111-111-111-0002',
    email: 'dtrifonov100@gmail.com',
    password: hashSync('Qwerty1!'),
    role: roles.globalSeller,
    language: Languages.ru,
    emailConfirmed: true,
    emailConfirmationToken: null,
    phoneConfirmationToken: null,
    phoneConfirmed: true,
    isSellerApproved: true,
    isSellerCompleted: true,
    isSellerInfoFilled: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  }, {
    firstName: 'Petya_1',
    lastName: 'User',
    phone: '111-111-111-0003',
    email: 'dtrifonov101@gmail.com',
    password: hashSync('Qwerty1!'),
    role: roles.user,
    language: Languages.ru,
    emailConfirmed: true,
    phoneConfirmed: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  },
  {
    firstName: 'Petya_2',
    lastName: 'User',
    phone: '111-111-111-0003',
    email: 'dtrifonov102@gmail.com',
    password: hashSync('Qwerty1!'),
    role: roles.user,
    language: Languages.ru,
    emailConfirmed: true,
    phoneConfirmed: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  }, {
    firstName: 'Vasya_3',
    lastName: 'Global Seller',
    phone: '111-111-111-0002',
    email: 'dtrifonov103@gmail.com',
    password: hashSync('Qwerty1!'),
    role: roles.globalSeller,
    language: Languages.ru,
    emailConfirmed: true,
    emailConfirmationToken: null,
    phoneConfirmationToken: null,
    phoneConfirmed: true,
    isSellerApproved: true,
    isSellerCompleted: true,
    isSellerInfoFilled: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  },
];
const otherAccounts = Array(560).fill('').map((item: any, index: number) => {
  return {
    firstName: `John ${index}`,
    lastName: `Doe ${index}`,
    phone: `111-111-111-${index}`,
    email: `test${index}@test.test`,
    password: hashSync('Qwerty1!'),
    role: roles.globalSeller,
    language: Languages.en,
    emailConfirmed: true,
    emailConfirmationToken: null,
    phoneConfirmationToken: null,
    phoneConfirmed: true,
    isActive: true,
    sellerApprovedAt: new Date(),
  };
});

const accountsData = {
  entity: Account,
  data: [...accounts, ...otherAccounts]
};

export default accountsData;