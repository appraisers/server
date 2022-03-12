import { EntityRepository, Repository } from 'typeorm';
import { Rating } from '../../entities/Rating';
import { ID } from '../../common/common.interfaces';
import {
  CreateRatingRepositoryData,
  LastUpdateRating,
  UpdateRating,
} from './rating.interfaces';

@EntityRepository(Rating)
export class RatingRepository extends Repository<Rating> {
  async createRating(data: CreateRatingRepositoryData): Promise<Rating> {
    const { review } = data;
    const rating = new Rating();
    rating.review = review;
    await this.save(rating);
    
    return rating;
  }

  async findRatingByReviewId(reviewId: ID): Promise<Rating | undefined> { 
    return this.createQueryBuilder('rating')
      .select('rating')
      .where('rating.review_id = :reviewId', { reviewId })
      .orderBy('rating.updatedAt', 'DESC')
      .getOne();
  }

  async updateRating(data: UpdateRating) {
    return this.createQueryBuilder('rating')
      .update(Rating)
      .set({
        effectivenessRating: data.effectivenessRating,
        interactionRating: data.interactionRating,
        assessmentOfAbilitiesRating: data.assessmentOfAbilitiesRating,
        personalQualitiesRating: data.personalQualitiesRating,
        effectivenessWeight: data.effectivenessWeight,
        interactionWeight: data.interactionWeight,
        assessmentOfAbilitiesWeight: data.assessmentOfAbilitiesWeight,
        personalQualitiesWeight: data.personalQualitiesWeight,
      })
      .where('id = :ratingId', { ratingId: data.ratingId })
      .execute();
  }

  async lastUpdateRating(data: LastUpdateRating) {
    return this.createQueryBuilder('rating')
      .update(Rating)
      .set({
        effectivenessRating: data.effectivenessRating,
        interactionRating: data.interactionRating,
        assessmentOfAbilitiesRating: data.assessmentOfAbilitiesRating,
        personalQualitiesRating: data.personalQualitiesRating,
        rating: data.rating,
        updatedAt: new Date(),
      })
      .where('id = :ratingId', { ratingId: data.ratingId })
      .execute();
  }
}
