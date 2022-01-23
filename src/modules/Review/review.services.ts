import { JWT } from 'fastify';
import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { DecodedJWT } from '../../common/common.interfaces';
import { ReviewRepository } from './review.repositories';
import { allErrors } from './review.messages';

export const checkReviewService = async (
  token: string, //access
  jwt: JWT
): Promise<Review> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const reviewRepo = getCustomRepository(ReviewRepository);
  const review = await reviewRepo.findOneReviewByKey('id', decoded.id);
  if (!review) throw buildError(400, allErrors.reviewIsNotFound);

  return review;
};
