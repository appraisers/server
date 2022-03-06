import { getCustomRepository } from 'typeorm';
import { allErrors } from '../../common/common.messages';
import { buildError } from '../../utils/error.helper';
import { Question } from '../../entities/Question';
import {
  AddQuestionRequestBody,
  DeleteQuestionsData,
  GetQuestionsRequestBody,
} from './question.interfaces';
import { QuestionRepository } from './question.repositories';

export const addQuestionService = async (
  data: AddQuestionRequestBody
): Promise<Question> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.createQuestion(data);
  return question;
};
export const getAllQuestionsService = async (): Promise<Question[]> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.getAllQuestions();
  return question;
};
export const getQuestionsService = async (
  data: GetQuestionsRequestBody
): Promise<Question[]> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.getQuestions(data);
  return question;
};
export const deleteQuestionsService = async (
  data: DeleteQuestionsData
): Promise<null> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const result = await questionRepo.deleteQuestions(data);
  if (!result?.affected) {
    throw buildError(400, allErrors.questionNotFoundOrDeleted);
  }

  return null;
};
