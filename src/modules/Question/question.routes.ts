import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import {AddQuestionRequestBody, QuestionResponse} from './question.interfaces';
import {addQuestionService} from './question.services';
import { loginService } from '../Auth/auth.services';
import { LoginRequestBody } from '../Auth/auth.interfaces';
const routes = async (fastify: FastifyInstance): Promise<void> => {
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<QuestionResponse> => {
    try {
      const { body } = request;
      const tokens = await loginService(body as LoginRequestBody, fastify.jwt);
      const question = await addQuestionService(body as AddQuestionRequestBody, `${tokens}`, fastify.jwt);
      return { ...commonResponse, question };
    } catch (error) {
      throw error;
    }
  };
  fastify.post('/add-question', addQuestionController);
};
export default routes;
