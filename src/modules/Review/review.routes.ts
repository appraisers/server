import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import {
  CheckReviewResponse,
  CheckReviewsData,
  CreateReviewData,
  CreateReviewResponse,
} from './review.interfaces';
import { allErrors } from './review.messages';
import { checkReviewsService, createReviewService } from './review.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const checkReviewController = async (
    request: FastifyRequest
  ): Promise<CheckReviewResponse> => {
    try {
      const { userId, offset, limit } = request.params as CheckReviewsData;
      const {
        headers: { authorization },
      } = request;
      if (!userId) throw buildError(400, allErrors.userIdNotFound);
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);

      const data: CheckReviewsData = {
        userId,
        offset,
        limit,
      };
      const reviews = await checkReviewsService(
        data,
        authorization,
        fastify.jwt
      );

      return {
        ...commonResponse,
        reviews,
      };
    } catch (error) {
      throw error;
    }
  };

  const createReviewController = async (
    request: FastifyRequest
  ): Promise<CreateReviewResponse> => {
    try {
      const { userId, description, rating } = request.body as CreateReviewData;
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      if (!userId) throw buildError(400, allErrors.userIdNotFound);

      const data: CreateReviewData = {
        userId,
        description,
        rating,
      };
      const review = await createReviewService(
        data,
        authorization,
        fastify.jwt
      );

      return {
        ...commonResponse,
        review,
      };
    } catch (error) {
      throw error;
    }
  };

  fastify.get('/check/:userId', checkReviewController);
  fastify.post('/create_review', createReviewController);
};

export default routes;
