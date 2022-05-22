import { User } from '../../entities/User';
import { Appraise } from '../../entities/Appraise';
import { CommonResponse, ID } from '../../common/common.interfaces';

export interface AppraiseResponse {
  appraises: Appraise[];
}

export interface CreateAppraiseResponse {
  user: User;
  author: User;
}

export interface SetAppraiseStatusResponse {
  userId: ID;
  authorId: ID;
}

export interface GetAppraiseResponse {
  userId: ID;
  authorId: ID;
  limit: number;
  offset: number;
  createdAtAfter: Date;
  lastMonth: boolean;
  lastYear: boolean;
}

export interface GetAppraisesUsersData {
  userId: ID;
  authorId: ID;
  limit: number;
  offset: number;
}

export interface GetAppraisesUsersResponseItem {
  id: ID;
  fullname: string;
  type: string;
}

export interface GetAppraisesUsersResponse extends CommonResponse {
  users: GetAppraisesUsersResponseItem[];
}
