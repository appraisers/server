import { CommonResponse, ID } from '../../common/common.interfaces';
import { Review } from '../../entities/Review';

export interface CheckReviewResponse extends CommonResponse {
  reviews: Review[];
}

export interface CheckReviewsServiceData {
  userId: ID,
  offset: number,
  limit: number,
}
