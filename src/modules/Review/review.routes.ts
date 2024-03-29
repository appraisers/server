import { FastifyRequest, FastifyInstance } from 'fastify';
import { CommonResponse } from '../../common/common.interfaces';
import { commonResponse } from '../../common/common.constants';
import { allErrors } from '../../common/common.messages';
import { buildError } from '../../utils/error.helper';
import { roles, User } from '../../entities/User';
import { checkAuthHook, allowedFor } from '../../utils/utils';
import {
  AddAnswerData,
  AddAnswerControllerResponse,
  InviteAppriceData,
  CheckReviewResponse,
  CheckReviewsData,
  FinishAnswerData,
  CreateReviewData,
} from './review.interfaces';
import {
  addAnswerService,
  checkReviewsService,
  inviteAppriceService,
  addFinishAnswerService,
  rateableService,
} from './review.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const checkReviewController = async (
    request: FastifyRequest
  ): Promise<CheckReviewResponse> => {
    try {
      const { userId, offset, limit } = request.params as CheckReviewsData;
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

  const inviteAppriceController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await inviteAppriceService(body as InviteAppriceData);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const addAnswerController = async (
    request: FastifyRequest
  ): Promise<AddAnswerControllerResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const { body } = request;
      const { id: authorId } = request.user as User;
      const isLastAnswer = await addAnswerService(
        body as AddAnswerData,
        authorId,
        authorization,
        fastify.jwt
      );
      return { ...commonResponse, isLastAnswer };
    } catch (error) {
      throw error;
    }
  };

  const addFinishAnswerController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const { body } = request;
      await addFinishAnswerService(body as FinishAnswerData);
      return { ...commonResponse };
    } catch (error) {
      throw error;
    }
  };

  const rateableController = async (
    request: FastifyRequest
  ): Promise<boolean> => {
    try {
      const { userId } = request.query as CreateReviewData;
      if (!userId) throw buildError(400, allErrors.userIdNotFound);
      const { id: authorId } = request.user as User;
      const rateable = await rateableService(userId, authorId);
      return rateable;
    } catch (error) {
      throw error;
    }
  };

  fastify.get(
    '/check/:userId',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    checkReviewController
  );
  fastify.post(
    '/add_answer',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    addAnswerController
  );
  fastify.post(
    '/invite_appraise',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    inviteAppriceController
  );
  fastify.post(
    '/finish-answer',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    addFinishAnswerController
  );
  fastify.get(
    '/rateable',
    {
      onRequest: checkAuthHook(fastify.jwt),
    },
    rateableController
  );
};

export default routes;
