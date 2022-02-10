import { getCustomRepository } from 'typeorm';
import { JWT } from 'fastify-jwt';
import { Question } from '../../entities/Question';
import {
  AddQuestionRequestBody,
  GetQuestionsRequestBody,
} from './question.interfaces';
import { DecodedJWT } from '../../common/common.interfaces';
import { allErrors } from '../../common/common.messages';
import { QuestionRepository } from './question.repositories';
import { checkAdminOrModeratorService } from '../User/user.services';
import { buildError } from '../../utils/error.helper';

export const addQuestionService = async (
  data: AddQuestionRequestBody,
  token: string,
  jwt: JWT
): Promise<Question> => {
  const decoded: DecodedJWT = jwt.verify(token);
  const isAdminOrModerator = await checkAdminOrModeratorService(
    decoded.id,
    token,
    jwt
  );
  if (isAdminOrModerator) {
    const questionRepo = getCustomRepository(QuestionRepository);
    const question = await questionRepo.createQuestion(data);
    return question;
  } else {
    throw buildError(400, allErrors.tokenNotFound);
  }
};
export const getQuestionsService = async (
  data: GetQuestionsRequestBody
): Promise<Question[]> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.getQuestion(data);
  return question;
};
