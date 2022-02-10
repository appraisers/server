import { FastifyRequest, FastifyInstance } from 'fastify';
import { allErrors } from '../../common/common.messages';
import { commonResponse } from '../../common/common.constants';
import { CommonResponse } from '../../common/common.interfaces';
import { buildError } from '../../utils/error.helper';
import {
  AllInviteUsersResponse,
  AllUsersResponse,
  CheckAuthResponse,
  ChangeUserRoleResponse,
  ChangeUserRoleRequestBody,
  DeleteUserResponse,
  DeleteUserRequestBody,
  InviteUserRequestBody,
  UpdateUserRequestBody,
  UpdateUserResponse,
} from './user.interfaces';
import {
  allInviteUsersService,
  allUsersService,
  checkUserService,
  changeUserRoleService,
  deleteUserService,
  inviteUserService,
  updateUserService,
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
  const updateUserController = async (
    request: FastifyRequest
  ): Promise<UpdateUserResponse> => {
    try {
      const { body } = request;
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const user = await updateUserService(
        body as UpdateUserRequestBody,
        authorization,
        fastify.jwt
      );
      return { ...commonResponse, user };
    } catch (error) {
      throw error;
    }
  };
  const inviteUserController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      await inviteUserService(body as InviteUserRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };
  const allInviteUsersController = async (
    request: FastifyRequest
  ): Promise<AllInviteUsersResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);

      const users = await allInviteUsersService(authorization, fastify.jwt);

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
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);

      const users = await allUsersService(authorization, fastify.jwt);

      return {
        ...commonResponse,
        users,
      };
    } catch (error) {
      throw error;
    }
  };
  const deleteUserController = async (
    request: FastifyRequest
  ): Promise<DeleteUserResponse> => {
    try {
      const { body } = request;
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const user = await deleteUserService(
        body as DeleteUserRequestBody,
        authorization,
        fastify.jwt
      );
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
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const user = await changeUserRoleService(
        body as ChangeUserRoleRequestBody,
        authorization,
        fastify.jwt
      );
      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      throw error;
    }
  };
  fastify.get('/all-users', allUsersController);
  fastify.get('/all-invite-users', allInviteUsersController);
  fastify.get('/check', checkUserController);
  fastify.post('/update', updateUserController);
  fastify.post('/invite', inviteUserController);
  fastify.post('/delete', deleteUserController);
  fastify.post('/change-role', changeUserRoleController);
};

export default routes;
