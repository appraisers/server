import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import {
  AddQuestionRequestBody,
  QuestionResponse,
} from './question.interfaces';
import { addQuestionService } from './question.services';
import { getQuestionsService } from './question.services';
import { loginService } from '../Auth/auth.services';
import { allErrors } from '../Auth/auth.messages';
import { LoginRequestBody } from '../Auth/auth.interfaces';
import { buildError } from '../../utils/error.helper';
import { GetQuestionsData } from './question.interfaces';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<QuestionResponse> => {
    try {
      const { body } = request;
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
  ): Promise<QuestionResponse> => {
    try {
      const { questionId } = request.params as GetQuestionsData;
      const getquestions = await getQuestionsService(questionId);
      // const getquestions = await getQuestionsService(questionId);
      return { ...commonResponse, getquestions };
    } catch (error) {
      throw error;
    }
  };
  fastify.post('/add-question', addQuestionController);
  fastify.get('/questions', getQuestionsController);
};
export default routes;
