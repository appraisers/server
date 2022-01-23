import { EntityRepository, Repository } from 'typeorm';
import { Review } from '../../entities/Review';
import { REVIEWS_LIMIT, REVIEWS_OFFSET } from './review.constants';
import { CheckReviewsData } from './review.interfaces';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  async findReviews(data: CheckReviewsData): Promise<Review[] | undefined> {
    const { userId, offset, limit } = data;
    return (
      this.createQueryBuilder('review')
        .leftJoin('review.user', 'user')
        .leftJoin('review.author', 'author')
        .select(['review', 'user', 'author'])
        .where('review.user_id = :userId', { userId })
        .orderBy(`review.createdAt`, 'ASC')
        .offset(offset ? Number(offset) : REVIEWS_OFFSET)
        .limit(limit ? Number(limit) : REVIEWS_LIMIT)
        .getMany()
    );
  }
}
