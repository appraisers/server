import { getCustomRepository } from 'typeorm';
import { Question } from '../../entities/Question';
import { AddQuestionRequestBody, QuestionId } from './question.interfaces';
import { DecodedJWT } from 'src/common/common.interfaces';
import { UserRepository } from '../Auth/auth.repositories';
import { JWT } from 'fastify-jwt';
import { QuestionRepository } from './question.repositories';
import { CommonResponse, ID } from '../../common/common.interfaces';
import { checkAdminOrModeratorService } from '../User/user.services';
import { GetQuestionsRequestBody } from './question.interfaces';
export const addQuestionService = async (
  data: AddQuestionRequestBody,
  token: string,
  jwt: JWT
): Promise<Question | undefined> => {
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
  }
};
export const getQuestionsService = async (
  data: GetQuestionsRequestBody
): Promise<{}> => {
  const questionRepo = getCustomRepository(QuestionRepository);
  const question = await questionRepo.getQuestion(data);
  return question;
};
