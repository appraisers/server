import { User } from '../../entities/User';
import { Review } from '../../entities/Review';
import { CommonResponse, ID } from '../../common/common.interfaces';

export interface CheckReviewResponse extends CommonResponse {
  reviews: Review[];
}

export interface CreateReviewResponse extends CommonResponse {
  review: Review;
}

export interface InviteAppriceResponse extends CommonResponse {
  user: InviteAppriceData[];
}
export interface InviteAppriceData {
  userId: number;
  email: string;
}

export interface CheckReviewsData {
  userId: ID;
  offset: number;
  limit: number;
}

export interface CreateReviewData {
  userId: ID;
}

export interface CreateReviewRepositoryData extends CreateReviewData {
  author: User;
  user: User;
}

export interface AddAnswerData {
  userId: ID;
  ids: ID[];
  answers: number[];
  isLastAnswer: boolean;
}

export interface UpdateTemporaryRatingData {
  reviewId: ID;
  temporaryRating: number;
  answeredQuestions: number;
}

export interface LastUpdateTemporaryRatingData {
  reviewId: ID;
  temporaryRating: number;
  answeredQuestions: number;
  activeSession: boolean;
  rating: number;
}
