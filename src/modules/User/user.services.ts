import { getCustomRepository } from 'typeorm';
import { allErrors } from  '../../common/common.messages';
import { DecodedJWT, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { buildError } from '../../utils/error.helper';
import { roles, User } from '../../entities/User';
import { UserRepository } from './user.repositories';
import {
  AllInviteUsersServiceResponse,
  AllUsersServiceResponse,
  ChangeUserRoleRequestBody,
  DeleteUserRequestBody,
  InviteUserRequestBody,
  UpdateUserRequestBody,
} from './user.interfaces';

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

export const checkAdminService = async (
  id: number,
  token: string,
  jwt: JWT
): Promise<boolean> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', id);
  if (!user) throw buildError(400, allErrors.userNotFound);
  if (user.role === roles.admin) {
    return true;
  }
  return false;
};

export const allInviteUsersService = async (
  token: string,
  jwt: JWT
): Promise<AllInviteUsersServiceResponse[]> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);

  const isAdminOrModerator = await checkAdminOrModeratorService(
    decoded.id,
    token,
    jwt
  );
  if (isAdminOrModerator) {
    const users = await userRepo.getAllUsers();
    if (!users) throw buildError(400, allErrors.usersNotFound);
    const mapUser = users.map((user) => ({
      email: user.email ?? '',
      fullname: user.fullname ?? '',
    }));
    return mapUser;
  }
  return [];
};

export const allUsersService = async (
  token: string,
  jwt: JWT
): Promise<AllUsersServiceResponse[]> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);

  const isAdminOrModerator = await checkAdminOrModeratorService(
    decoded.id,
    token,
    jwt
  );
  if (isAdminOrModerator) {
    const users = await userRepo.getAllUsers();
    if (!users) throw buildError(400, allErrors.usersNotFound);
    const mapUser = users.map((user) => ({
      fullname: user.fullname ?? '',
      updatedReviewAt: user.updatedReviewAt ?? '',
      rating: user.rating ?? null,
    }));
    return mapUser;
  }
  return [];
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
export const updateUserService = async (
  data: UpdateUserRequestBody,
  token: string,
  jwt: JWT
): Promise<User> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const isAUser = await userRepo.findOne({ where: { id: decoded.id } });
  if (!isAUser) throw buildError(400, allErrors.userNotFound);

  const updateResult = await userRepo.updateUser({ ...data, id: decoded.id });
  if (!updateResult?.affected) throw buildError(400, allErrors.userNotFound);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userNotFound);

  return user;
};

export const deleteUserService = async (
  data: DeleteUserRequestBody,
  token: string,
  jwt: JWT
): Promise<User> => {
  const { userId } = data;
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);

  const isAdminOrModerator = await checkAdminOrModeratorService(
    decoded.id,
    token,
    jwt
  );
  if (isAdminOrModerator) {
    const isUser = await userRepo.findOneUserByKey('id', userId);
    if (!isUser) throw buildError(400, allErrors.userNotFound);

    const deleteResult = await userRepo.deleteUser({ userId });
    if (!deleteResult?.affected) throw buildError(400, allErrors.userNotFound);
  }
  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);
  return user;
};

export const changeUserRoleService = async (
  data: ChangeUserRoleRequestBody,
  token: string,
  jwt: JWT
): Promise<User> => {
  const { userId, role } = data;
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);

  const isAdmin = await checkAdminService(
    decoded.id,
    token,
    jwt
  );
  if (isAdmin) {
    const isUser = await userRepo.findOneUserByKey('id', userId);
    if (!isUser) throw buildError(400, allErrors.userNotFound);
    // Check role in enum Roles
    if(!(roles[role])) throw buildError(400, allErrors.roleNotFound)

    const changeRoleResult = await userRepo.changeRoleUser({ ...data, userId });
    if (!changeRoleResult?.affected) throw buildError(400, allErrors.userNotFound);
  }
  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);
  return user;
};

export const inviteUserService = async (
  body: InviteUserRequestBody
): Promise<null> => {
  if (!body.email) throw buildError(400, allErrors.emailNotFound);
  sendEmail({
    type: 'invite-user',
    emailTo: body.email,
    subject: 'Invite in appraisers app',
    // replacements: {
    //   link: `${FRONTEND_URL}/invite`,
    // }
  });
  return null;
};
