import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import {
  CheckReviewResponse,
  CheckReviewsData,
} from './review.interfaces';
import { allErrors } from './review.messages';
import { checkReviewsService } from './review.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const checkReviewController = async (
    request: FastifyRequest
  ): Promise<CheckReviewResponse> => {
    try {
      const {
        userId,
        offset,
        limit,
      } = request.params as CheckReviewsData;
      if (!userId) throw buildError(400, allErrors.userIdNotFound);

      const data: CheckReviewsData = {
        userId,
        offset,
        limit,
      };
      const reviews = await checkReviewsService(data);

      return {
        ...commonResponse,
        reviews,
      };
    } catch (error) {
      throw error;
    }
  };

  fastify.get('/check/:userId', checkReviewController);
};

export default routes;
