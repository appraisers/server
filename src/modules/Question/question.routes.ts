import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { checkAuthHook, allowedFor } from '../../utils/utils';
import { buildError } from '../../utils/error.helper';
import { CommonResponse } from '../../common/common.interfaces';
import { allErrors } from '../../common/common.messages';
import { roles } from '../../entities/User';
import { category } from '../../entities/Question';
import {
  AddQuestionRequestBody,
  GetQuestionResponse,
  QuestionResponse,
  GetQuestionsRequestBody,
  DeleteQuestionsData,
  GetCategoriesController,
} from './question.interfaces';
import {
  addQuestionService,
  deleteQuestionsService,
  getQuestionsService,
  getAllQuestionsService,
} from './question.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const getCategoriesController = async (): Promise<
    GetCategoriesController
  > => {
    const categories = category;
    return { ...commonResponse, categories };
  };
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<QuestionResponse> => {
    const { body } = request;
    try {
      const question = await addQuestionService(body as AddQuestionRequestBody);
      return { ...commonResponse, question };
    } catch (error) {
      throw error;
    }
  };
  const getQuestionsController = async (
    request: FastifyRequest
  ): Promise<GetQuestionResponse | null> => {
    try {
      const {
        offset,
        limit,
        position,
        allQuestions,
      } = request.query as GetQuestionsRequestBody;

      if (allQuestions) {
        const questions = await getAllQuestionsService();
        return { ...commonResponse, questions };
      } else if (offset != null && limit != null && position != null) {
        const data: GetQuestionsRequestBody = {
          offset,
          limit,
          position,
        };
        const questions = await getQuestionsService(data);
        return { ...commonResponse, questions };
      }
      throw buildError(400, allErrors.offsetOrLimitNotFound);
    } catch (error) {
      throw error;
    }
  };
  const DeleteQuestionsData = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await deleteQuestionsService(body as DeleteQuestionsData);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };
  fastify.post(
    '/add-question',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    addQuestionController
  );
  fastify.get(
    '/get-category',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    getCategoriesController
  );
  fastify.get('/questions', getQuestionsController);
  fastify.post(
    '/delete',
    {
      onRequest: checkAuthHook(fastify.jwt),
      preValidation: allowedFor([roles.admin, roles.moderator]),
    },
    DeleteQuestionsData
  );
};
export default routes;
