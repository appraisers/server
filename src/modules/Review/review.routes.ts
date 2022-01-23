import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import { CheckReviewResponse } from './review.interfaces';
import { checkReviewSchema } from './review.schemas';
import { checkReviewService } from './review.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const checkReviewController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CheckReviewResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, 'Token is not found!');

      const review = await checkReviewService(authorization, fastify.jwt);

      return {
        ...commonResponse,
        review,
      };
    } catch (error) {
      throw error;
    }
  };

  fastify.get('/check', checkReviewSchema, checkReviewController);
};

export default routes;
