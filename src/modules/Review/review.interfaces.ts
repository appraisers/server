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
}

export interface AddAnswerControllerResponse extends CommonResponse {
  isLastAnswer: boolean;
}

export interface UpdateTemporaryRatingData {
  reviewId: ID;
  temporaryRating: number;
  answeredQuestions: number;
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
}

export interface LastUpdateTemporaryRatingData {
  reviewId: ID;
  temporaryRating: number;
  answeredQuestions: number;
  activeSession: boolean;
  rating: number;
  description: string;
}

export interface FinishAnswerData {
  userId: ID;
  description: string;
}
