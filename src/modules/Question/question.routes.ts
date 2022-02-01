import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import {AddQuestionRequestBody, RegistrationResponse} from './question.interfaces';
import {registrationSchema} from './question.schemas';
import {registrationService} from './question.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  
  const addQuestionController = async (
    request: FastifyRequest
  ): Promise<RegistrationResponse> => {
    try {
      const { body } = request;
      const review = await registrationService(body as AddQuestionRequestBody);
      return { ...commonResponse, review };
    } catch (error) {
      throw error;
    }
  };

  fastify.post('/addquestion', registrationSchema, addQuestionController);
  
};

export default routes;
