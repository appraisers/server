import { getCustomRepository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import { buildError } from '../../utils/error.helper';
import { allErrors } from '../../common/common.messages';
import { AppraiseRepository } from './appraise.repositories';
import {
  GetAppraiseResponse,
  GetAppraisesUsersData,
  GetAppraisesUsersResponseItem,
} from './appraise.interfaces';

export const getAppraisesService = async (
  data: GetAppraiseResponse
): Promise<Appraise[]> => {
  const appraiseRepo = getCustomRepository(AppraiseRepository);
  const appraise = await appraiseRepo.findAppraises(data);
  if (!appraise) throw buildError(400, allErrors.appraiseNotFound);
  return appraise;
};

export const getAppraisesUsersService = async (
  data: GetAppraisesUsersData
): Promise<GetAppraisesUsersResponseItem[]> => {
  const appraiseRepo = getCustomRepository(AppraiseRepository);
  const appraises = await appraiseRepo.findAppraisesUsers(data);
  if (!appraises) throw buildError(400, allErrors.appraiseNotFound);
  const users: GetAppraisesUsersResponseItem[] = [];
  appraises.forEach((appraise) => {
    if (data.authorId != null && appraise.author != null) {
      const isAlreadyUser =
        users.findIndex((user) => user.id === appraise.author.id) >= 0;
      if (!isAlreadyUser) {
        users.push({
          fullname: appraise.author?.fullname!,
          id: appraise.author.id,
        });
      }
    } else if (appraise.user != null) {
      const isAlreadyUser =
        users.findIndex((user) => user.id === appraise.user.id) >= 0;
      if (!isAlreadyUser) {
        users.push({
          fullname: appraise.user?.fullname!,
          id: appraise.user.id,
        });
      }
    }
  });
  return users;
};
