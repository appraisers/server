import { CommonResponse, ID } from '../../common/common.interfaces';
import { Position, Roles, User } from '../../entities/User';

export interface CheckAuthResponse extends CommonResponse {
  user: User;
}
export interface UserWithCategoriesService {
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
  ratingByCategories: null;
}

export interface UserWithCategories extends CommonResponse {
  user: User | UserWithCategoriesService;
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
  deletedAt: Date | null;
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
export interface ToggleUserResponse extends CommonResponse {
  user: User;
}
export interface ToggleUserRepositoryData {
  userId: ID;
  type: 'delete' | 'restore';
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
  isAdminOrModerator: boolean;
}
export interface RequestUserBody {
  userId: ID;
}
export interface ToggleShowInfoData {
  userId: ID;
  showInfo: boolean;
}
export interface TopUsersData extends CommonResponse {
  data: User[];
}
export interface GetUserBody {
  userId: ID;
}
export interface GetUserResponse extends CommonResponse {
  user: User;
}

export interface GetAllUsersBody {
  alphabet: string;
  rating: string;
  updatedAt: string;
  position: string;
}
