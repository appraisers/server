import { FastifyRequest, FastifyInstance } from 'fastify';
import { CommonResponse } from '../../common/common.interfaces';
import { commonResponse } from '../../common/common.constants';
import { allErrors } from '../../common/common.messages';
import { buildError } from '../../utils/error.helper';
import {
  AddAnswerData,
  InviteAppriceData,
  CheckReviewResponse,
  CheckReviewsData,
  CreateReviewData,
  CreateReviewResponse,
} from './review.interfaces';
import {
  addAnswerService,
  checkReviewsService,
  createReviewService,
  inviteAppriceService,
} from './review.services';

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

  const inviteAppriceController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);

      await inviteAppriceService(
        body as InviteAppriceData,
        authorization,
        fastify.jwt
      );

      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const addAnswerController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const { body } = request;
      await addAnswerService(body as AddAnswerData, authorization, fastify.jwt);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  fastify.get('/check/:userId', checkReviewController);
  fastify.post('/add_answer', addAnswerController);
  fastify.post('/invite_appraise', inviteAppriceController);
};

export default routes;
