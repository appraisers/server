
import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Question';
import config from '../../config';
import {
  RegisterRequestBody,
} from './question.interfaces';
import { QuestionRepository } from './question.repositories';


const { FRONTEND_URL } = config;

export const registrationService = async (
  data: RegisterRequestBody
): Promise<Review> => {
  const userRepo = getCustomRepository(QuestionRepository);
  const { description } = data;
  const question = await userRepo.createQuestion(data);
  return question;
};

