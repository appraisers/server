import { getCustomRepository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import { buildError } from '../../utils/error.helper';
import { allErrors } from '../../common/common.messages';
import { AppraiseRepository } from './appraise.repositories';
import { getAppraiseResponse } from './appraise.interfaces';

export const getAppraisesService = async (
    data: getAppraiseResponse
): Promise<Appraise[]> => {
    const appraiseRepo = getCustomRepository(AppraiseRepository);
    const appraise = await appraiseRepo.findAppraiseByUserAndAuthor(data);
    if (!appraise) throw buildError(400, allErrors.appraiseNotFound);
    return appraise;
};
