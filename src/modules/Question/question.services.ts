
import { getCustomRepository } from 'typeorm';
import { Question } from '../../entities/Question';
import { AddQuestionRequestBody } from './question.interfaces';
import { DecodedJWT } from 'src/common/common.interfaces';
import { UserRepository } from '../Auth/auth.repositories';
import { JWT } from 'fastify-jwt';
import { QuestionRepository } from './question.repositories';
import { allErrors } from './question.messages';
import { checkAdminOrModeratorService } from '../User/user.services';
export const addQuestionService = async(
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
  }
};

