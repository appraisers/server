import { getCustomRepository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import { buildError } from '../../utils/error.helper';
import { allErrors } from '../../common/common.messages';
import { AppraiseRepository } from './appraise.repositories';
import { getAppraiseResponse, getAppraisesUsersData } from './appraise.interfaces';

export const getAppraisesService = async (
    data: getAppraiseResponse
): Promise<Appraise[]> => {
    const appraiseRepo = getCustomRepository(AppraiseRepository);
    const appraise = await appraiseRepo.findAppraises(data);
    if (!appraise) throw buildError(400, allErrors.appraiseNotFound);
    return appraise;
};

export const getAppraisesUsersService = async (
    data: getAppraisesUsersData
): Promise<string[]> => {
    const appraiseRepo = getCustomRepository(AppraiseRepository);
    const appraises = await appraiseRepo.findAppraisesUsers(data);
    if (!appraises) throw buildError(400, allErrors.appraiseNotFound);
    let users: string[] = [];
    appraises.forEach(appraise => {
        if (appraise.author != null) {
            const name = appraise.author.fullname;
            if (name != null) {
                if (users.includes(name) === false) users.push(name);
            };
        } else {
            const name = appraise.user.fullname;
            if (name != null) {
                if (users.includes(name) === false) users.push(name);
            };
        }
    });
    return users;
};
