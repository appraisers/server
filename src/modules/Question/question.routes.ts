import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import {AddQuestionRequestBody, RegistrationResponse} from './question.interfaces';
import {registrationService} from './question.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<RegistrationResponse> => {
    try {
      const { body } = request;
      const question = await registrationService(body as AddQuestionRequestBody);
      return { ...commonResponse, question };
    } catch (error) {
      throw error;
    }
  };

  fastify.post('/addquestion', addQuestionController);
  
};

export default routes;
