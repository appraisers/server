import { JWT } from 'fastify';
import { getCustomRepository } from 'typeorm';
import { buildError } from '../../utils/error.helper';
import { DecodedJWT } from '../../common/common.interfaces';
import { UserRepository } from './user.repositories';
import { allErrors } from './user.messages';
import { User } from '../../entities/User';

export const checkUserService = async (
    token: string,
    jwt: JWT
  ): Promise<User> => {
    const decoded: DecodedJWT = jwt.verify(token);
    if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
    const userRepo = getCustomRepository(UserRepository);
    const user = await userRepo.findOneUserByKey('id', decoded.id);
    if (!user) throw buildError(400, allErrors.userNotFound);
  
    return user;
  };