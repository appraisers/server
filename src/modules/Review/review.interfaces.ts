import { CommonResponse } from 'src/common/common.interfaces';
import { Review } from '../../entities/Review';

export interface CheckReviewResponse extends CommonResponse {
  review: Review;
}
