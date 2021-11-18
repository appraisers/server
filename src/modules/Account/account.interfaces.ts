import { Business } from '../../entities/Business';
import { Address } from '../../entities/Address';
import { Category } from '../../entities/Category';
import { Account } from '../../entities/Account';
import { Languages } from '../../entities/Account'
import { File } from '../../utils/multer';
export interface GetOneSellerRequest {
  accountId: number,
}
export interface CommonResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface GetOneSellerResponse extends CommonResponse {
  business: Business;
}
export interface AccountRequest {
  accountId: number | string;
}
export interface AccountRequestRepositoryData {
  accountId: number;
}
export interface AccountResponse extends CommonResponse {
  account: Category[]
}
export interface UpdatePasswordRepositoryData {
  account: Account,
  password: string,
}
export interface InviteSellerRequestBody {
  firstName: string,
  lastName: string,
  email: string,
}
export interface InviteSellerRequestBody {
  firstName: string,
  lastName: string,
  email: string,
}
export interface UpdateBuyerRequestParams {
  accountId: string,
}
export interface RemoveBuyersParams {
  accountId: string,
}
export interface ChangeBuyerStatusParams {
  accountId: string,
}
export interface ChangeBuyersArrayStatusBody {
  accountsId: string[],
  isActive: boolean,
}
export interface RemoveBuyersArrayParams {
  accountsIds: string,
}
export interface InviteSellerResponse extends CommonResponse {
  seller: Account;
}

export interface GetOneBuyerResponse extends CommonResponse {
  buyer: Account;
}

export interface UpdateSellerRequestBody extends CommonResponse {
  type: string, // ???
  firstName: string,
  lastName: string,
  email: string,
  oldPassword: string,
  newPassword: string,
  name: string,
  primaryContactPerson: string,
  companyRegNumber: string,
  VATNumber: string,
  phoneForVerification: string,
  location: string,
  longitude: string,
  latitude: string,
  address1: string,
  address2: string,
  city: string,
  state: string,
  country: string,
  zipCode: string,
  timeZone: string,
  dateOfBirth: string,
  comment: string,
}
export interface UpdateSellerRequest {
  firstName: string,
  lastName: string,
  // email: string,
  password: string,
  account: Account,
  address: Address,
  business: Business,
}
export interface UpdateBuyerRequest {
  firstName?: string,
  lastName?: string,
  email?: string,
  accountId: number,
  phone?: string,
  language?: Languages,
}
export interface UpdateOneBuyerRequest {
  firstName?: string,
  lastName?: string,
  email: string,
  account: Account,
  phone?: string,
  language?: Languages,
  avatarFiles?: File[],
}
export interface UpdateBuyerRepositoryData {
  firstName?: string,
  lastName?: string,
  email?: string,
  accountId: number,
  phone?: string,
  language?: Languages,
}

export interface CreateAddressRequest {
    longitude: string;
    latitude: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
}

export interface RemoveBuyerRequest {
  accountId: string,
}
export interface RemoveBuyersArrayRequest {
  accountsId: string[],
}
export interface ChangeBuyersArrayStatusRequest {
  accountsId: string[],
  isActive: boolean,
}
export interface ChangeBuyerStatusRequest {
  accountId: string,
  isActive: boolean,
}
export interface UpdateSellerResponse extends CommonResponse {
  account: Account
}

export interface UpdateSellerCompletedRequest {
  accountId: number,
  isSellerCompleted: boolean,
}

export interface UpdateAccountRequest {
  accountId: number,
  [n: string]: any,
}

export interface GetSellerBusinessRequestData {
  query: {
    categoryId: string
  },
  params: {
    sellerId: string
  },
  user: Account,
}
