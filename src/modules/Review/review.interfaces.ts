import { User } from '../../entities/User';
import { Review } from '../../entities/Review';
import { CommonResponse, ID } from '../../common/common.interfaces';

export interface CheckReviewResponse extends CommonResponse {
  reviews: Review[];
}

export interface CreateReviewResponse extends CommonResponse {
  review: Review;
}

export interface CheckReviewsData {
  userId: ID,
  offset: number,
  limit: number,
}

export interface CreateReviewData {
  userId: ID,
  description: string;
  rating: number;
}

export interface CreateReviewRepositoryData extends CreateReviewData {
  author: User,
  user: User
}
