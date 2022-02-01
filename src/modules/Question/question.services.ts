
import { getCustomRepository } from 'typeorm';
import { Question } from 'src/entities/Question';
import {
  AddQuestionRequestBody,
} from './question.interfaces';
import { QuestionRepository } from './question.repositories';


export const registrationService = async (
  data: AddQuestionRequestBody
): Promise<Question> => {
  const userRepo = getCustomRepository(QuestionRepository);
  const question = await userRepo.createQuestion(data);
  return question;
};

