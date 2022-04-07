import { getCustomRepository } from 'typeorm';
import base64 from 'base-64';
import { allErrors } from '../../common/common.messages';
import { DecodedJWT, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { buildError } from '../../utils/error.helper';
import { roles, User } from '../../entities/User';
import config from '../../config';
import { UserRepository } from './user.repositories';
import {
  AllInviteUsersServiceResponse,
  AllUsersServiceResponse,
  ChangeUserRoleRequestBody,
  GetUserInfoBody,
  InviteUserRequestBody,
  ToggleUserRepositoryData,
  UpdateUserRequestBody,
  UserWithCategoriesService,
} from './user.interfaces';

const { FRONTEND_URL } = config;


export const checkAdminOrModeratorService = async (
  id: number,
  token: string,
  jwt: JWT
): Promise<boolean> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', id);
  if (!user) throw buildError(400, allErrors.userNotFound);
  if (user.role === roles.admin || user.role === roles.moderator) {
    return true;
  }
  return false;
};

export const allInviteUsersService = async (): Promise<
  AllInviteUsersServiceResponse[]
> => {
  const userRepo = getCustomRepository(UserRepository);
  const users = await userRepo.getAllUsers();
  if (!users) throw buildError(400, allErrors.usersNotFound);
  const mapUser = users.map((user) => ({
    email: user.email ?? '',
    fullname: user.fullname ?? '',
  }));
  return mapUser;
};

export const allUsersService = async (): Promise<AllUsersServiceResponse[]> => {
  const userRepo = getCustomRepository(UserRepository);

  const users = await userRepo.getAllUsers();
  if (!users) throw buildError(400, allErrors.usersNotFound);
  const mapUser = users.map((user) => ({
    id: user.id,
    fullname: user.fullname ?? '',
    updatedReviewAt: user.updatedReviewAt ?? '',
    rating: user.rating ?? null,
    position: user.position ?? '',
    numberOfCompletedReviews: user.numberOfCompletedReviews ?? null,
    deletedAt: user.deletedAt ?? null,
  }));
  return mapUser;
};
export const checkUserService = async (
  token: string,
  jwt: JWT
): Promise<User> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userNotFound);

  return user;
};

export const getUserInfoService = async (
  data: GetUserInfoBody,
): Promise<UserWithCategoriesService | User> => {
  const { userId } = data;
  const userRepo = getCustomRepository(UserRepository);
  let user = await userRepo.getUserById({ userId });
  if (!user) throw buildError(400, allErrors.userNotFound);
  const ratingByCategories = user?.ratingByCategories;
  if (ratingByCategories != null && Array.isArray(ratingByCategories)) {
    let effectivenessRating = 0;
    let interactionRating = 0;
    let assessmentOfAbilitiesRating = 0;
    let personalQualitiesRating = 0;
    const countRatingByCategories = ratingByCategories.length;
    ratingByCategories.forEach((rating: UserWithCategoriesService) => {
      effectivenessRating += rating.effectivenessRating;
      interactionRating += rating.interactionRating;
      assessmentOfAbilitiesRating += rating.assessmentOfAbilitiesRating;
      personalQualitiesRating += rating.personalQualitiesRating;
    });
    effectivenessRating /= countRatingByCategories;
    interactionRating /= countRatingByCategories;
    assessmentOfAbilitiesRating /= countRatingByCategories;
    personalQualitiesRating /= countRatingByCategories;
    const newUser = { ...user, effectivenessRating, interactionRating, assessmentOfAbilitiesRating, personalQualitiesRating, ratingByCategories: null };
    return newUser;
  }
  return user;
};

export const updateUserService = async (
  data: UpdateUserRequestBody
): Promise<User> => {
  const userRepo = getCustomRepository(UserRepository);
  const updateResult = await userRepo.updateUser({ ...data });
  if (!updateResult?.affected) throw buildError(400, allErrors.userNotFound);
  const user = await userRepo.findOneUserByKey('id', data.id ?? data.authorId);
  if (!user) throw buildError(400, allErrors.userNotFound);

  return user;
};

export const toggleUserService = async (
  data: ToggleUserRepositoryData
): Promise<User> => {
  const { userId } = data;
  const userRepo = getCustomRepository(UserRepository);

  const deleteResult = await userRepo.toggleUser({ ...data });
  if (!deleteResult?.affected) throw buildError(400, allErrors.userNotFound);
  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);

  return user;
};

export const changeUserRoleService = async (
  data: ChangeUserRoleRequestBody
): Promise<User> => {
  const { userId, role } = data;
  const userRepo = getCustomRepository(UserRepository);

  // Check role in enum Roles
  if (!roles[role]) throw buildError(400, allErrors.roleNotFound);

  const changeRoleResult = await userRepo.changeRoleUser({ ...data, userId });
  if (!changeRoleResult?.affected) {
    throw buildError(400, allErrors.userNotFound);
  }

  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);
  return user;
};

export const inviteUserService = async (
  body: InviteUserRequestBody
): Promise<null> => {
  if (!body.email) throw buildError(400, allErrors.emailNotFound);
  const userRepo = getCustomRepository(UserRepository);
  const isAlreadyUser = await userRepo.findOne({
    where: { email: body.email },
  });
  if (isAlreadyUser) throw buildError(400, allErrors.userFound);
  const token = base64.encode(body.email);
  sendEmail({
    type: 'invite-user',
    emailTo: body.email,
    subject: 'Invite in appraisers app',
    replacements: {
      link: `${FRONTEND_URL}/registration/${token}`,
    },
  });
  return null;
};