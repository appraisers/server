import { filesUpload } from './../../utils/multer';
import bcrypt from 'bcryptjs';
import { CreateOrUpdateBusinessRequest, GetSellerInformationRequest } from './../Business/business.interfaces';
import { createAddressService } from './../Address/address.services';
import { createOrUpdateBusinessService, deleteImageService, getOptionalInformationService } from './../Business/business.services';
import { SellerRegisterRequest } from './../BecomeSellerRequest/becomeSellerRequest.interfaces';
import { genRandomPassword } from './../../utils/utils';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { Account, roles } from '../../entities/Account';
import { allowedFor, checkAuthHook } from '../Auth/auth.utils';
import {
  CommonResponse,
  InviteSellerRequestBody,
  InviteSellerResponse,
  UpdateSellerRequest,
  UpdateSellerRequestBody,
  GetOneSellerResponse,
  UpdateBuyerRequestParams,
  ChangeBuyerStatusParams,
  ChangeBuyersArrayStatusBody,
  RemoveBuyersArrayParams,
  RemoveBuyersParams,
  UpdateBuyerRequest,
  GetOneBuyerResponse,
  UpdateOneBuyerRequest,
  GetSellerBusinessRequestData,
  CreateAddressRequest,
} from './account.interfaces';

import {
  adminRegisterService,
  isSellerCompletedService,
  sellerRegisterService,
  sendSellerCredentialsService
} from '../BecomeSellerRequest/becomeSellerRequest.services';
import {
  getOneAccountService,
  updateSellerService,
  getBuyersService,
  getAllSellersService,
  removeBuyersService,
  changeBuyerStatusService,
  updateBuyerService,
  removeBuyersArrayService,
  changeBuyersArrayStatusService,
  getOneSellerService,
  updateOneSellerService,
  changeSellerStatusService,
  removeSellerService,
  getOneBuyerService,
  updateOneBuyerService,
  getSellerBusinessInformationService,
} from './account.services';
import { CreateOrUpdateBusinessVerificationAddressRequest } from '../Address/address.interfaces';
import buildError from '../../utils/error.helper';
import { types as addressTypes } from '../../entities/Address';
import { File } from '../../utils/multer';
import { createOrUpdateBusinessVerificationAddressService } from '../Address/address.services';
import { deleteMediaService } from '../Media/media.services';

// eslint-disable-next-line @typescript-eslint/require-await
const routes = async (fastify: FastifyInstance): Promise<void> => {
  const commonResponse = {
    statusCode: 200,
    message: 'Success',
  };
  const nothingToDeleteResponse = {
    statusCode: 200,
    message: 'Nothing to delete',
  };

  const getBuyersController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {
      const account = request.user as Account;
      const extendedAccount = await getBuyersService();
      return {
        ...commonResponse,
        extendedAccount
      }
    } catch (error) {
      console.log('get one account error', error.message);
      throw error;
    }
  };

  const getAllSellersController = async (): Promise<any> => {
    try {
      const extendedAccount = await getAllSellersService();
      return {
        ...commonResponse,
        extendedAccount
      }
    } catch (error) {
      console.log('get all sellers error', error.message);
      throw error;
    }
  };

  const getSellerOptionalInfoController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {
      const {
        params: {
          sellerId
        }
      } = request as any;
      const { categoryId } = request.query as any;

      const businessInformation = await getOptionalInformationService({
        accountId: sellerId,
        categoryId
      });

      return {
        ...commonResponse,
        businessInformation,
      }
    } catch (error) {
      console.log('get optional info error', error);
      throw error;
    }
  };

  const updateOneSellerController = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<any> => {
    try {
      const { accountId } = request.params as any;
      const { firstName, lastName, email } = request.body as any;
      const account = request.user as Account;

      const updatedSeller = await updateOneSellerService({ accountId, firstName, lastName, email } as any);
      return updatedSeller;
      // return affected ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('Update Buyer account error', error);
      throw error;
    }
  };
  const removeBuyersController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountId } = request.params as RemoveBuyersParams;
      const account = request.user as Account;
      const affected = await removeBuyersService({ accountId } as RemoveBuyersParams);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };

  const removeSellerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountId } = request.params as RemoveBuyersParams;
      const account = request.user as Account;
      const affected = await removeSellerService({ accountId } as any);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };
  const removeBuyersArrayController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountsIds } = request.query as RemoveBuyersArrayParams;
      const account = request.user as Account;
      const affected = await removeBuyersArrayService({ accountsId: accountsIds.split(',') } as any);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };

  // bulk change status
  const changeBuyersArrayStatusController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountsId, isActive } = request.body as ChangeBuyersArrayStatusBody;
      const account = request.user as Account;
      const affected = await changeBuyersArrayStatusService({ accountsId, isActive } as ChangeBuyersArrayStatusBody);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };


  const changeBuyerStatusController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountId } = request.params as ChangeBuyerStatusParams;
      const { isActive } = request.body as any;
      const account = request.user as Account;
      const affected = await changeBuyerStatusService({ accountId, isActive } as any);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };

  const changeSellerStatusController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse | any> => {
    try {
      const { accountId } = request.params as ChangeBuyerStatusParams;
      const { isActive } = request.body as any;
      const account = request.user as Account;
      const affected = await changeSellerStatusService({ accountId, isActive } as any);
      return affected > 0 ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('account error', error.message);
      throw error;
    }
  };

  const updateBuyerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse> => {
    try {
      const { accountId } = request.params as UpdateBuyerRequestParams;
      const { firstName, lastName, email } = request.body as any;
      const account = request.user as Account;
      const affected = await updateBuyerService({ accountId, firstName, lastName, email } as any);
      return affected ? commonResponse : nothingToDeleteResponse;
    } catch (error) {
      console.log('Update Buyer account error', error);
      throw error;
    }
  };

  const getOneSellerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<GetOneSellerResponse> => {
    try {
      const {
        params: {
          accountId,
        }
      } = request as any;
      // const account = request.user as Account;

      const seller = await getOneSellerService({ accountId });
      return {
        ...commonResponse,
        business: seller,
      }
    } catch (error) {
      console.log('update seller account error', error);
      throw error;
    }
  };

  const updateSellerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse> => {
    try {
      const account = request.user as Account;
      const {
        type,
        firstName,
        lastName,
        // email,
        oldPassword,
        newPassword,
        name,
        primaryContactPerson,
        companyRegNumber,
        VATNumber,
        phoneForVerification,
        location,
        longitude,
        latitude,
        address1,
        address2,
        city,
        state,
        country,
        zipCode,
        timeZone,
        dateOfBirth,
        comment,
      } = request.body as UpdateSellerRequestBody;
      const mediaFiles = (request as any).files as unknown as File[];

      if (oldPassword && newPassword) {
        const compare = bcrypt.compareSync(oldPassword, account.password);
        if (oldPassword === newPassword) return {statusCode: 400, message: 'Old password and new password must not match'};
        if (!compare) return {statusCode: 400, message: 'Password not valid'};
      }

      // -0 business -
      const dataForCreateOrUpdateBusiness = {
        type,
        primaryContactPerson,
        displayName: name,
        location,
        name,
        companyRegNumber,
        phoneForVerification,
        account,
        dateOfBirth,
        mediaFiles,
        VATNumber,
      } as CreateOrUpdateBusinessRequest;

      const business = await createOrUpdateBusinessService(dataForCreateOrUpdateBusiness);

      // const business = await createBusinessService(dataForCreateBusiness);
      // -1 address -
      const dataForCreateOrUpdateBusinessVerificationAddress = {
        type: addressTypes.businessVerification,
        longitude,
        latitude,
        address1,
        address2,
        city,
        state,
        country,
        zipCode,
        comment,
        timeZone,
        business,
        account,
      } as CreateOrUpdateBusinessVerificationAddressRequest;
      const address = await createOrUpdateBusinessVerificationAddressService(dataForCreateOrUpdateBusinessVerificationAddress);
      // const address = await createAddressService(dataForCreateAddress);
      // -2 seller -
      const dataForUpdateSeller = {
        firstName,
        lastName,
        // email,
        password: newPassword,
        account,
      } as UpdateSellerRequest;
      const seller = await updateSellerService(dataForUpdateSeller);

      const dataForIsSellerComplete = {
        account,
      }
      const isSellerComplete = await isSellerCompletedService(dataForIsSellerComplete);

      return {
        ...commonResponse,
      }
    } catch (error) {
      console.log('update seller account error', error);
      throw error;
    }
  };

  const getOneAccountController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {
      const account = request.user as Account;
      const extendedAccount = await getOneAccountService({ accountId: account.id });
      return {
        ...commonResponse,
        account: extendedAccount
      }
    } catch (error) {
      console.log('get one account error', error.message);
      throw error;
    }
  };

  const inviteSellerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<InviteSellerResponse> => {
    try {
      const { email } = request.body as InviteSellerRequestBody;
      const account = request.user as Account;
      const passwordHash = genRandomPassword(10);
      const dataForSellerRegister = {
        email,
        password: passwordHash,
      } as SellerRegisterRequest;
      const seller = await sellerRegisterService(dataForSellerRegister);
      await sendSellerCredentialsService({ account: seller });
      return {
        ...commonResponse,
        seller
      }
    } catch (error) {
      console.log('get one account error', error.message);
      throw error;
    }
  };

  const inviteAdminController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {
      const { email } = request.body as InviteSellerRequestBody;
      const account = request.user as Account;
      const passwordHash = genRandomPassword(10);
      const dataForSellerRegister = {
        email,
        password: passwordHash,
      } as SellerRegisterRequest;
      const admin = await adminRegisterService(dataForSellerRegister);
      await sendSellerCredentialsService({ account: admin });
      return {
        ...commonResponse,
        admin
      }
    } catch (error: any) {
      console.log('get one account error', error.message);
      throw error;
    }
  };


  const getOneBuyerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<GetOneBuyerResponse> => {
    try {
      const account = request.user as Account;
      const buyer = await getOneBuyerService(account.id);
      return {
        ...commonResponse,
        buyer,
      }
    } catch (error) {
      console.log('update seller account error', error);
      throw error;
    }
  };

  const getSellerBusinessController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {
      const {
        params: { sellerId },
        user: account,
      } = request as GetSellerBusinessRequestData;
      const dataForFullBusinessInformation = {
        ownerId: account?.id ?? null,
        accountId: Number(sellerId),
      } as GetSellerInformationRequest;
      const seller = await getSellerBusinessInformationService(dataForFullBusinessInformation);
      return {
        ...commonResponse,
        seller,
      }
    } catch (error) {
      console.log('update seller account error', error);
      throw error;
    }
  };

  const createAddressController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse> => {
    try {
      const account = request.user as Account;
      const { lng: longitude, lat: latitude, address1, address2, city, country, state, zipCode} = request.body as any;

      const dataForCreateAddressRequest = {
        account,
        longitude,
        latitude,
        address1,
        address2: address2? address2 : '',
        city,
        country,
        state,
        zipCode,
        type: addressTypes.account
      } as CreateAddressRequest;
      const address = await createAddressService(dataForCreateAddressRequest);
      console.log(address);

      return {
        ...commonResponse,
      }
    } catch (error) {
      console.log('address error', error.message);
      throw error;
    }
  };

  const updateOneBuyerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    try {

      const {
        body: {
          firstName,
          lastName,
          email,
          phone,
          language,
        },
        user: account,
      } = request as any;

      const avatarFiles: File[] | undefined = (request as any).files;

      const dataForUpdateBuyer: UpdateOneBuyerRequest = {
        account,
        firstName,
        lastName,
        email,
        phone,
        language,
        avatarFiles,
      };
      const updatedResult = await updateOneBuyerService(dataForUpdateBuyer);
      if (updatedResult) {
        const buyer = await getOneBuyerService(account.id);
        return {
          ...commonResponse,
          updatedBuyer: buyer
        }
      } else {
        return nothingToDeleteResponse;
      }

    } catch (error) {
      console.log('update buyer account error', error);
      throw error;
    }
  };

  const deleteAccountImageController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse> => {
    try {
      const { fileName, mediaId } = request.body as any;
      const account = request.user as Account;
      deleteImageService(fileName);

      const dataForDeleteMedia = { mediaId: Number(mediaId) }
      const deleted = await deleteMediaService(dataForDeleteMedia);

      return deleted?.affected ? {
        ...commonResponse,
      } : {
        ...commonResponse,
        message: 'Nothing to delete',
      }
    } catch (error) {
      console.log('delete account image error', error);
      throw error;
    }
  }

  fastify.get('/buyer', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.user,
    ]),
  }, getOneBuyerController);

  fastify.post('/buyer', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.user,
    ]),
  }, createAddressController);

  fastify.put('/buyer', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.user,
    ]),
    preHandler: filesUpload('avatarMedia'),
  }, updateOneBuyerController);

  fastify.get('/buyers', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ]),
  }, getBuyersController);


  fastify.get('/user', {
    preHandler: checkAuthHook(fastify.jwt),
  }, getOneAccountController); // TODO change methods to ...User

  fastify.get('/sellers', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ]),
  }, getAllSellersController);

  fastify.get('/:sellerId/seller', {
    onRequest: checkAuthHook(fastify.jwt, false),
  }, getSellerBusinessController);

  fastify.get('/:sellerId/optional_info', {
    onRequest: checkAuthHook(fastify.jwt, false),
  }, getSellerOptionalInfoController);

  fastify.get('/seller/:accountId', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
      roles.localSeller,
      roles.globalSeller,
    ]),
  }, getOneSellerController);

  fastify.put('/seller', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
      roles.localSeller,
      roles.globalSeller,
    ]),
    preHandler: filesUpload('identityMedia'),
    // schema: createListingSchema,
  }, updateSellerController);


  fastify.post('/invite-seller', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ]),
  }, inviteSellerController);

  fastify.post('/invite-admin', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ]),
  }, inviteAdminController);


  fastify.delete('/sellers/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, removeSellerController);

  fastify.delete('/buyers/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, removeBuyersController);

  fastify.delete('/buyers', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ])
  }, removeBuyersArrayController);

  fastify.put('/buyers/change_status/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, changeBuyerStatusController);

  fastify.put('/sellers/change_status/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, changeSellerStatusController);

  fastify.put('/buyers/update_buyer/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, updateBuyerController);

  fastify.put('/sellers/update_seller/:accountId', {
    preHandler: checkAuthHook(fastify.jwt)
  }, updateOneSellerController);

  fastify.put('/buyers/bulk_change_status', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.admin,
    ])
  }, changeBuyersArrayStatusController);

  fastify.delete('/buyer/image', {
    onRequest: checkAuthHook(fastify.jwt),
    preValidation: allowedFor([
      roles.user,
    ]),
  }, deleteAccountImageController);
};

export default routes;
