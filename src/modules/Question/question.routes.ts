import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { buildError } from '../../utils/error.helper';
import { allErrors } from '../Auth/auth.messages';
import {
  AddQuestionRequestBody,
  GetQuestionResponse,
  QuestionResponse,
} from './question.interfaces';
import { addQuestionService } from './question.services';
import { getQuestionsService } from './question.services';
import { GetQuestionsRequestBody } from './question.interfaces';

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
      const id = Number(
        JSON.parse(JSON.stringify(request.query as GetQuestionsRequestBody))[
          'id'
        ]
      );
      const data: GetQuestionsRequestBody = {
        id,
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
