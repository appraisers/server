import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import { allErrors } from './question.messages';
import {
  AddQuestionRequestBody,
  GetQuestionResponse,
  QuestionResponse,
  GetQuestionsRequestBody,
} from './question.interfaces';
import { addQuestionService, getQuestionsService } from './question.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<QuestionResponse> => {
    const { body } = request;
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, allErrors.tokenNotFound);
      const question = await addQuestionService(
        body as AddQuestionRequestBody,
        authorization,
        fastify.jwt
      );
      return { ...commonResponse, question };
    } catch (error) {
      throw error;
    }
  };
  const getQuestionsController = async (
    request: FastifyRequest
  ): Promise<GetQuestionResponse> => {
    try {
      const { offset, limit } = request.query as GetQuestionsRequestBody;
      const data: GetQuestionsRequestBody = {
        offset,
        limit,
      };
      const questions = await getQuestionsService(data);
      return { ...commonResponse, questions };
    } catch (error) {
      throw error;
    }
  };
  fastify.post('/add-question', addQuestionController);
  fastify.get('/questions', getQuestionsController);
};
export default routes;
