import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import {
   CheckAuthResponse,

} from './user.interfaces';
import { allErrors } from './user.messages';
import { checkUserService } from './user.services';

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
 

  fastify.get('/check', checkUserController);
};

export default routes;
