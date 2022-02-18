import { CommonResponse, ID } from '../../common/common.interfaces';
import { Position, Roles, User } from '../../entities/User';

export interface CheckAuthResponse extends CommonResponse {
  user: User;
}

export interface AllInviteUsersServiceResponse {
  fullname: string;
  email: string;
}
export interface AllInviteUsersResponse extends CommonResponse {
  users: AllInviteUsersServiceResponse[];
}

export interface AllUsersServiceResponse {
  fullname: string;
  updatedReviewAt: Date;
  rating: number;
}
export interface AllUsersResponse extends CommonResponse {
  users: AllUsersServiceResponse[];
}

export type RegisterRepositoryData = RegisterRequestBody;
export interface RegisterRequestBody {
  email: string;
  workplace: string;
  fullname: string;
  password: string;
}

export interface UpdateUserRequestBody {
  token: string;
  id: ID;
  authorId: ID;
  email: string;
  password: string;
  workplace: string;
  fullname: string;
  position: Position;
  rating: number;
  role: Roles;
}
export type UpdateRepositoryData = UpdateUserRequestBody;
export interface UpdateUserResponse extends CommonResponse {
  user: User;
}

export interface InviteUserRequestBody {
  email: string;
}
export interface DeleteUserResponse extends CommonResponse {
  user: User;
}
export interface DeleteUserRequestBody {
  userId: ID;
}
export interface ChangeUserRoleResponse extends CommonResponse {
  user: User;
}
export interface ChangeUserRoleRequestBody {
  userId: ID;
  role: Roles;
}
export interface GetUserInfoBody {
  userId: ID;
}
