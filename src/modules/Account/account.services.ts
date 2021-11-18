import { BusinessRepository } from './../Business/business.repository';
import { BusinessInformation } from './../../entities/BusinessInformation';
import { hashSync } from 'bcryptjs';
import buildError from '../../utils/error.helper';
import { Account } from '../../entities/Account';
import { getCustomRepository, UpdateResult } from 'typeorm';
import {
  AccountRequest,
  ChangeBuyersArrayStatusRequest,
  ChangeBuyerStatusRequest,
  GetOneSellerRequest,
  RemoveBuyerRequest,
  RemoveBuyersArrayRequest,
  UpdateAccountRequest,
  UpdateBuyerRequest,
  UpdateOneBuyerRequest,
  UpdateSellerRequest
} from './account.interfaces';
import { AccountRepository } from './account.repository';
import { Business } from '../../entities/Business';
import { types as mediaTypes } from '../../entities/Media';
import { BecomeSellerRequestRepository } from '../BecomeSellerRequest/becomeSellerRequest.repository';
import { MediaRepository } from '../Media/media.repository';
import { checkUserEmail } from '../Auth/auth.services';

export const getOneAccountService = async (
  data: AccountRequest
): Promise<Account> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const account = await accountRepo.getOneAccount(data);
  if (!account) throw buildError(400, 'Account not found');
  return account;
};

export const removeSellerService = async (
  data: RemoveBuyerRequest
): Promise<any> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.removeSeller(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};
export const getBuyersService = async (): Promise<Account[]> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const buyers = await accountRepo.getBuyers();
  if (!buyers) throw buildError(400, 'Buyers not found');
  return buyers;
};

export const getAllSellersService = async (): Promise<Account[]> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const sellers = await accountRepo.getAllSellers();
  if (!sellers) throw buildError(400, 'Sellers not found');
  return sellers;
};

export const removeBuyersService = async (
  data: RemoveBuyerRequest
): Promise<number> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.removeBuyer(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};

export const removeBuyersArrayService = async (
  data: RemoveBuyersArrayRequest
): Promise<number> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.removeBuyersArray(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};

export const changeBuyersArrayStatusService = async (
  data: ChangeBuyersArrayStatusRequest
): Promise<number> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.changeBuyersArrayStatus(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};

export const changeSellersArrayStatusService = async (
  data: any
): Promise<any> => {
  const accountRepo = getCustomRepository(BecomeSellerRequestRepository);
  const updateResult = await accountRepo.changeSellersArrayStatus(data);
  if (!updateResult) throw buildError(400, 'Something went wrong with changing status');
  return updateResult.affected ?? 0;
};
export const changeBuyerStatusService = async (
  data: ChangeBuyerStatusRequest
): Promise<number> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.changeBuyerStatus(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};

export const getSellersService = async (data: any): Promise<any> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const sellers = await accountRepo.allSellers(data);
  return sellers;
};

export const changeSellerStatusService = async (
  data: any
): Promise<any> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updateResult = await accountRepo.changeSellerStatus(data);
  if (!updateResult) throw buildError(400, 'Something went wrong');
  return updateResult.affected ?? 0;
};
export const getOneSellerService = async (
  data: GetOneSellerRequest
): Promise<Business> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const account = await accountRepo.getOneSeller(data);
  if (!account) throw buildError(400, 'Account not found');
  return account;
};

export const updateSellerService = async (
  data: UpdateSellerRequest
): Promise<Account> => {
  const accountRepo = getCustomRepository(AccountRepository);

  if (data.password) data.password = hashSync(data.password);

  const updatedAccount = await accountRepo.updateSeller(data);
  if (!updatedAccount) throw buildError(400, 'Account not found');
  return updatedAccount;
};



export const updateOneSellerService = async (
  data: any
): Promise<any> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updatedAccount = await accountRepo.updateOneSeller(data);
  // if (!updatedAccount) throw buildError(400, 'Account not found');
  return updatedAccount;
}
export const updateAccountService = async (
  data: UpdateAccountRequest,
): Promise<UpdateResult> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const updated: UpdateResult = await accountRepo.updateAccount(data);
  if (!updated?.affected) throw buildError(400, 'Account not updated');
  return updated;
};

export const getOneBuyerService = async (
  accountId: number
): Promise<Account> => {
  const accountRepo = getCustomRepository(AccountRepository);
  const buyer = await accountRepo.getOneBuyer(accountId);
  if (!buyer) throw buildError(400, 'Account not found');
  return buyer;
};

export const updateBuyerService = async (
  data: UpdateBuyerRequest
): Promise<Account> => {
  const accountRepo = getCustomRepository(AccountRepository);

  const update = await accountRepo.updateBuyer(data);

  const updatedBuyer = await accountRepo.getOneBuyer(Number(data.accountId));
  if (!updatedBuyer) throw buildError(400, 'Account not found');
  return updatedBuyer
}

export const updateOneBuyerService = async (
  data: UpdateOneBuyerRequest
): Promise<UpdateResult> => {
  const { account, avatarFiles, firstName, lastName, email, phone, language } = data;
  const accountRepo = getCustomRepository(AccountRepository);
  const mediaRepo = getCustomRepository(MediaRepository);

  const userExistId = await checkUserEmail(email);
  if (userExistId && userExistId !== account.id) throw buildError(400, 'That email already exists');

  const dataForUpdatedResult = { accountId: account.id, firstName, lastName, email, phone, language };
  const updateResult = await accountRepo.updateOneBuyer(dataForUpdatedResult);


  if (!updateResult?.affected) throw buildError(400, 'Account not found');
  // const dataForDeleteMedias = { type: mediaTypes.businessInformation, accountId: account.id, };
  // await deleteMediaService(dataForDeleteMedias);
  if (avatarFiles) {
    const medias = await mediaRepo.createMedias({
      type: mediaTypes.userAvatar,
      mediaFiles: avatarFiles,
      account,
    });
  }

  return updateResult;
}

export const getSellerBusinessInformationService = async (
  data: any
): Promise<BusinessInformation | BusinessInformation[]> => {
  const businessRepo = getCustomRepository(BusinessRepository);
  const grade = await businessRepo.getSellerGrade(data);
  const account = await businessRepo.getSellerBusinessInformation(data);
  if (!account) throw buildError(400, 'Business information not found');
  return { ...account, ...grade };
};
// export const updateOneSellerService = async (
//   data: any,
// ): Promise<any> => {
//   const accountRepo = getCustomRepository(AccountRepository);
//   const buyer: any = await accountRepo.updateOnebuyer(data);
//   if (!buyer) throw buildError(400, 'Buyer not updated');
//   return buyer;
// };