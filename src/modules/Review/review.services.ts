import { JWT } from 'fastify';
import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { ReviewRepository } from './review.repositories';
import { allErrors } from './review.messages';
import { CheckReviewsData } from './review.interfaces';

export const checkReviewsService = async (
  data: CheckReviewsData
): Promise<Review[]> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const reviews = await reviewRepo.findReviews(data);
  if (!reviews) throw buildError(400, allErrors.reviewsIsNotFound);
  return reviews;
};
