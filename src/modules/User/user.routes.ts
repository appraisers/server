import { FastifyRequest, FastifyInstance } from 'fastify';
import { allErrors } from '../../common/common.messages';
import { commonResponse } from '../../common/common.constants';
import { CommonResponse } from '../../common/common.interfaces';
import { buildError } from '../../utils/error.helper';
import { checkAuthHook, allowedFor } from '../../utils/utils';
import { roles, User } from '../../entities/User';
import {
  AllInviteUsersResponse,
  AllUsersResponse,
  CheckAuthResponse,
  ChangeUserRoleResponse,
  ChangeUserRoleRequestBody,
  ToggleUserResponse,
  ToggleUserRepositoryData,
  GetUserInfoBody,
  InviteUserRequestBody,
  UpdateUserRequestBody,
  UpdateUserResponse,
  UserWithCategories,
  TopUsersData,
  GetUserResponse,
  GetUserBody,
  GetAllUsersBody,
  RequestUserBody
} from './user.interfaces';
import {
  allInviteUsersService,
  allUsersService,
  checkUserService,
  getUserInfoService,
  changeUserRoleService,
  toggleUserService,
  inviteUserService,
  updateUserService,
  selfRequestService,
  toggleShowInfoService,
  getTopUsersService,
  getUserService
} from './user.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const checkUserController = async (
    request: FastifyRequest
  ): Promise<CheckAuthResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const user = await checkUserService(authorization, fastify.jwt);
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      if (error instanceof Error && error.message === allErrors.jwtExpires) {
        throw buildError(401, allErrors.jwtExpires);
      }
      throw error;
    }
  };
  const getUserInfoController = async (
    request: FastifyRequest
  ): Promise<UserWithCategories> => {
    try {
      const { body } = request;
      const user = await getUserInfoService(body as GetUserInfoBody);
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      throw error;
    }
  };
  const updateUserController = async (
    request: FastifyRequest
  ): Promise<UpdateUserResponse> => {
    try {
      const { body } = request;
      const { id: authorId } = request.user as User;
      const data = Object.assign(body, { authorId });
      const updatedUser = await updateUserService(
        data as UpdateUserRequestBody
      );
      return { ...commonResponse, user: updatedUser };
    } catch (error) {
      throw error;
    }
  };
  const inviteUserController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await inviteUserService(body as InviteUserRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };
  const allInviteUsersController = async (
  ): Promise<
    AllInviteUsersResponse
  > => {
    try {
      const users = await allInviteUsersService();
      return {
        ...commonResponse,
        users,
      };
    } catch (error) {
      throw error;
    }
  };
  const allUsersController = async (
    request: FastifyRequest
  ): Promise<AllUsersResponse> => {
    try {
      const {
        alphabet,
        rating,
        updatedAt,
        position
      } = request.query as GetAllUsersBody;
      const users = await allUsersService({ alphabet, rating, updatedAt, position });


      return {
        ...commonResponse,
        users,
      };
    } catch (error) {
      throw error;
    }
  };
  const toggleUserController = async (
    request: FastifyRequest
  ): Promise<ToggleUserResponse> => {
    try {
      const { body } = request;
      const user = await toggleUserService(body as ToggleUserRepositoryData);
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      throw error;
    }
  };
  const changeUserRoleController = async (
    request: FastifyRequest
  ): Promise<ChangeUserRoleResponse> => {
    try {
      const { body } = request;
      const user = await changeUserRoleService(
        body as ChangeUserRoleRequestBody
      );
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      throw error;
    }
  };
  const requestUserController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await selfRequestService(
        body as GetUserInfoBody
      );
      return {
        ...commonResponse,
      };
    } catch (error) {
      throw error;
    }
  };
  const toggleShowInfoController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await toggleShowInfoService(
        body as GetUserInfoBody
      );
      return {
        ...commonResponse,
      };
    } catch (error) {
      throw error;
    }
  };
  const getTopUsersController = async (): Promise<TopUsersData> => {
    try {
      const data = await getTopUsersService();
      return {
        ...commonResponse,
        data,
      };
    } catch (error) {
      throw error;
    }
  };
  const getUserController = async (
    request: FastifyRequest
  ): Promise<GetUserResponse> => {
    try {
      const { body } = request;
      const user = await getUserService(body as RequestUserBody);
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      throw error;
    }
  };

  fastify.get(
    '/all-users',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    allUsersController
  );
  fastify.get(
    '/all-invite-users',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    allInviteUsersController
  );
  // TODO: delete it in future
  fastify.get('/check', checkUserController);
  fastify.post('/get-info', getUserInfoController);
  fastify.post(
    '/update',
    { onRequest: checkAuthHook(fastify.jwt) },
    updateUserController
  );
  fastify.post('/invite', inviteUserController);
  fastify.post(
    '/toggle-user',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    toggleUserController
  );
  fastify.post(
    '/change-role',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin]),
    },
    changeUserRoleController
  );
  fastify.post(
    '/request',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    requestUserController
  );
  fastify.post(
    '/toggle-show-info',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    toggleShowInfoController
  );
  fastify.get(
    '/top',
    {
      onRequest: checkAuthHook(fastify.jwt)
    },
    getTopUsersController
  );
  fastify.post(
    '/info',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    getUserController
  );
};

export default routes;
