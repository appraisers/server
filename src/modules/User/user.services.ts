import { getCustomRepository } from 'typeorm';
import base64 from 'base-64';
import { allErrors } from '../../common/common.messages';
import { DecodedJWT, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { buildError } from '../../utils/error.helper';
import { Roles, roles, User } from '../../entities/User';
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
    workplace: user.workplace ?? null,
    email: user.email ?? '',
    role: user.role ?? Roles.USER
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
  let checkUser = await userRepo.getUserById({ userId });
  if (!checkUser) throw buildError(400, allErrors.userNotFound);
  const ratingByCategories = checkUser.ratingByCategories;
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
    if (checkUser.showInfo === false) {
      const smallUserInfo = await userRepo.userFewFields(checkUser.id, 'role');
      const user = { ...smallUserInfo, effectivenessRating, interactionRating, assessmentOfAbilitiesRating, personalQualitiesRating, ratingByCategories: null };
      return user;
    } else {
      const user = { ...checkUser, effectivenessRating, interactionRating, assessmentOfAbilitiesRating, personalQualitiesRating, ratingByCategories: null };
      return user;
    }
  }
  return checkUser;
};

export const getTopUsersService = async (): Promise<User[]> => {
  const userRepo = getCustomRepository(UserRepository);
  const users = await userRepo.getTopUsers();
  if (!users) throw buildError(400, allErrors.reviewNotFound);
  return users;
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
  const { email } = body;
  if (!email) throw buildError(400, allErrors.emailNotFound);
  const userRepo = getCustomRepository(UserRepository);
  const isAlreadyUser = await userRepo.findOne({
    where: { email },
  });
  if (isAlreadyUser) throw buildError(400, allErrors.userFound);
  const token = base64.encode(email);
  sendEmail({
    type: 'invite-user',
    emailTo: email,
    subject: 'Invite in appraisers app',
    replacements: {
      link: `${FRONTEND_URL}/registration/${token}`,
    },
  });
  return null;
};

export const selfRequestService = async (
  data: GetUserInfoBody
): Promise<null> => {
  const { userId } = data;
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.getUserById({ userId });
  if (!user) throw buildError(400, allErrors.userNotFound);
  const dateNow = new Date();
  const sixMonthAgo = new Date(dateNow.getFullYear(), dateNow.getMonth() - 5);
  if (user.updatedReviewAt <= sixMonthAgo && !user.isRequestedReview) {
    const selfRequest = await userRepo.selfRequest({ ...data });
    if (!selfRequest?.affected) throw buildError(400, allErrors.userNotFound);
    const moderators = await userRepo.getModerators();
    if (moderators != null) {
      moderators.forEach((moderator) => {
        sendEmail({
          type: 'Requested-review',
          emailTo: moderator.email,
          subject: 'Pending review in appraisers',
          replacements: {
            link: `${FRONTEND_URL}/users`,
            username: moderator.fullname
          }
        });
      })
    }
  } else throw buildError(400, allErrors.requestedReviewError)
  return null;
};

export const toggleShowInfoService = async (
  data: GetUserInfoBody
): Promise<null> => {
  const { userId } = data;
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.getUserById({ userId });
  if (!user) throw buildError(400, allErrors.userNotFound);
  const showInfo = !user.showInfo;
  await userRepo.toggleShowInfo({ userId, showInfo });
  return null;
};