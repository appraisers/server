import { EntityRepository, Repository } from 'typeorm';
import { Review } from '../../entities/Review';
import { ID } from '../../common/common.interfaces';
import { REVIEWS_LIMIT, REVIEWS_OFFSET } from './review.constants';
import {
  CheckReviewsData,
  CreateReviewRepositoryData,
  FinishAnswerData,
  LastUpdateTemporaryRatingData,
  UpdateTemporaryRatingData,
} from './review.interfaces';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  async findReviews(data: CheckReviewsData): Promise<Review[] | undefined> {
    const { userId, offset, limit } = data;
    return this.createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.author', 'author')
      .select(['review', 'user', 'author'])
      .where('review.user_id = :userId', { userId })
      .orderBy(`review.createdAt`, 'ASC')
      .offset(offset ? Number(offset) : REVIEWS_OFFSET)
      .limit(limit ? Number(limit) : REVIEWS_LIMIT)
      .getMany();
  }

  async createReview(data: CreateReviewRepositoryData): Promise<Review> {
    const { user, author } = data;

    const review = new Review();
    review.user = user;
    review.author = author;
    await this.save(review);

    return review;
  }

  async findReviewByUserId(userId: ID): Promise<Review | undefined> {
    return this.createQueryBuilder('review')
      .select('review')
      .where('user_id = :userId', { userId })
      .andWhere('active_session = true')
      .orderBy('review.createdAt', 'DESC')
      .getOne();
  }

  async updateTemporaryRating(data: UpdateTemporaryRatingData) {
    const {
      temporaryRating,
      effectivenessRating,
      interactionRating,
      assessmentOfAbilitiesRating,
      personalQualitiesRating,
      answeredQuestions,
      reviewId,
    } = data;
    return this.createQueryBuilder('review')
      .update(Review)
      .set({
        temporaryRating: temporaryRating,
        answeredQuestions: answeredQuestions,
        effectivenessRating: effectivenessRating,
        interactionRating: interactionRating,
        assessmentOfAbilitiesRating: assessmentOfAbilitiesRating,
        personalQualitiesRating: personalQualitiesRating,
        updatedAt: new Date(),
      })
      .where('id = :reviewId', {
        reviewId,
      })
      .execute();
  }

  async lastUpdateTemporaryRating(data: LastUpdateTemporaryRatingData) {
    const {
      temporaryRating,
      answeredQuestions,
      reviewId,
      activeSession,
      rating,
      description,
    } = data;
    return this.createQueryBuilder('review')
      .update(Review)
      .set({
        temporaryRating: temporaryRating,
        answeredQuestions: answeredQuestions,
        activeSession: activeSession,
        rating: rating,
        description: description,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
      .where('id = :reviewId', {
        reviewId,
      })
      .execute();
  }
  async setDescriptionReview(data: FinishAnswerData) {
    const { userId, description } = data;
    return this.createQueryBuilder('review')
      .update(Review)
      .set({
        description: description,
      })
      .where('id = :userId', {
        userId,
      })
      .execute();
  }
}
