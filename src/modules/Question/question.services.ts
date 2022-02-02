
import { getCustomRepository } from 'typeorm';
import { Question } from '../../entities/Question';
import {
  AddQuestionRequestBody,
} from './question.interfaces';
import { QuestionRepository } from './question.repositories';


export const addQuestionService = async (
  data: AddQuestionRequestBody
): Promise<Question> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.createQuestion(data);
  return question;
};

