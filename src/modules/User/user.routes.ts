import { FastifyRequest, FastifyInstance } from 'fastify';
import { sendEmail } from '../../utils/mail.helper';
import { commonResponse } from '../../common/common.constants';
import { CommonResponse } from '../../common/common.interfaces';
import { buildError } from '../../utils/error.helper';
import {
  CheckAuthResponse,
  InviteUserRequestBody,
  UpdateUserRequestBody,
  UpdateUserResponse,
} from './user.interfaces';
import { allErrors } from './user.messages';
import { checkUserService, inviteUserService, updateUserService } from './user.services';

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
    } catch (error: any) {
      if (error.message === allErrors.jwtExpires) {
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

  fastify.get('/check', checkUserController);
  fastify.post('/update', updateUserController);
  fastify.post('/invite', inviteUserController);
};

export default routes;
