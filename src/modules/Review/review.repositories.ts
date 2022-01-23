import { EntityRepository, Repository } from 'typeorm';
import { Review } from '../../entities/Review';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  async findOneReviewByKey<T extends keyof Review>(
    key: T,
    val: string | number
  ): Promise<Review | undefined> {
    return this.findOne({ where: { [key]: val } });
  }
}
